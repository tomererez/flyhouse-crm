import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Settings as SettingsIcon,
  Plane,
  Mail,
  DollarSign,
  Clock,
  Bell,
  Shield,
  Palette,
  Database,
  Users,
  Crown,
  Star,
  User,
  Trash2,
  Plus,
  Edit,
  Flame,
  Target
} from "lucide-react";
import { PriorityRule } from "@/api/entities";

const ruleTypeLabels = {
  departure_time: "Departure Time",
  source: "Lead Source",
  utm_campaign: "UTM Campaign",
  inactivity: "Inactivity Period",
  price_range: "Price Range"
};

const priorityRuleColors = {
  hot: "bg-red-100 text-red-800 border-red-200",
  warm: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cold: "bg-blue-100 text-blue-800 border-blue-200"
};

function getRuleDescription(rule) {
  const { rule_type, conditions } = rule;
  switch (rule_type) {
    case 'departure_time':
      return `Flights departing within ${conditions.hours_before_departure} hours`;
    case 'source':
      return `From sources: ${conditions.source_values?.join(', ') || 'None specified'}`;
    case 'utm_campaign':
      return `UTM campaigns: ${conditions.utm_campaign_values?.join(', ') || 'None specified'}`;
    case 'inactivity':
      return `No contact for ${conditions.hours_since_contact} hours`;
    case 'price_range':
      return `Price range: $${conditions.min_price || 0} - $${conditions.max_price || '∞'}`;
    default:
      return 'Custom rule';
  }
}

function RuleForm({ rule, onSave, onCancel }) {
  const [formData, setFormData] = useState(rule || {
    name: '',
    rule_type: 'departure_time',
    priority: 'warm',
    active: true,
    order: 100,
    conditions: {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (rule) {
        await PriorityRule.update(rule.id, formData);
      } else {
        await PriorityRule.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Rule Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Urgent Flights"
          className="card-glass border-white/20"
        />
      </div>
      <div className="space-y-2">
        <Label>Rule Type</Label>
        <Select value={formData.rule_type} onValueChange={(value) => setFormData({...formData, rule_type: value})}>
          <SelectTrigger className="card-glass border-white/20"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="departure_time">Departure Time</SelectItem>
            <SelectItem value="source">Lead Source</SelectItem>
            <SelectItem value="utm_campaign">UTM Campaign</SelectItem>
            <SelectItem value="inactivity">Inactivity Period</SelectItem>
            <SelectItem value="price_range">Price Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
          <SelectTrigger className="card-glass border-white/20"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.rule_type === 'departure_time' && (
        <div className="space-y-2">
          <Label>Hours Before Departure</Label>
          <Input
            type="number"
            value={formData.conditions.hours_before_departure || ''}
            onChange={(e) => setFormData({
              ...formData, 
              conditions: {...formData.conditions, hours_before_departure: parseInt(e.target.value)}
            })}
            placeholder="48"
            className="card-glass border-white/20"
          />
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-[#1A1A1A] hover:bg-[#333]">{rule ? 'Update' : 'Create'} Rule</Button>
      </div>
    </form>
  );
}

export default function Settings() {
  const [rules, setRules] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  
  const [settings, setSettings] = useState({
    // General Settings
    company_name: "FlyHouse Europe",
    default_currency: "EUR",
    timezone: "Europe/London",
    
    // Assignment Rules
    auto_assign: true,
    assignment_rules: [
      { region: "UK", user_id: "user_1" },
      { region: "EU", user_id: "user_2" }
    ],
    
    // SLA Settings
    response_time_minutes: 10,
    follow_up_hours: 24,
    escalation_hours: 72,
    
    // Email Templates
    auto_reply_enabled: true,
    auto_reply_template: "Thank you for your flight request. We'll respond within 10 minutes.",
    follow_up_template: "Following up on your flight request...",
    
    // Notification Settings
    slack_webhook: "",
    telegram_bot_token: "",
    email_notifications: true,
    sms_notifications: false,
    
    // Aircraft Categories
    aircraft_categories: [
      { name: "Light Jet", hourly_rate_min: 2500, hourly_rate_max: 3500, cruise_speed: 450 },
      { name: "Mid-size Jet", hourly_rate_min: 3500, hourly_rate_max: 5000, cruise_speed: 520 },
      { name: "Heavy Jet", hourly_rate_min: 5000, hourly_rate_max: 8000, cruise_speed: 580 }
    ],

    // Client Tier Settings
    client_tiers: [
      { id: "new", name: "Newbie", icon: "user", min_flights: 0, min_revenue: 0, color: "#6B7280" },
      { id: "retainer", name: "Retainer", icon: "star", min_flights: 3, min_revenue: 100000, color: "#8B5CF6" },
      { id: "elite", name: "Elite", icon: "crown", min_flights: 10, min_revenue: 500000, color: "#F59E0B" }
    ]
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await PriorityRule.list('order');
      setRules(data);
    } catch (error) {
      console.error('Error loading priority rules:', error);
    }
  };

  const toggleRule = async (ruleId, active) => {
    try {
      await PriorityRule.update(ruleId, { active });
      setRules(rules.map(rule => rule.id === ruleId ? { ...rule, active } : rule));
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const deleteRule = async (ruleId) => {
    try {
      await PriorityRule.delete(ruleId);
      setRules(rules.filter(rule => rule.id !== ruleId));
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleSave = () => {
    console.log("Settings saved:", settings);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure your CRM system preferences</p>
        </div>
        
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-purple-600" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                className="card-glass border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={settings.default_currency} onValueChange={(value) => setSettings({...settings, default_currency: value})}>
                <SelectTrigger className="card-glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                <SelectTrigger className="card-glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SLA & Response Settings */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              SLA & Response Times
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response_time">Initial Response Time (minutes)</Label>
              <Input
                id="response_time"
                type="number"
                value={settings.response_time_minutes}
                onChange={(e) => setSettings({...settings, response_time_minutes: parseInt(e.target.value)})}
                className="card-glass border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="follow_up">Follow-up Time (hours)</Label>
              <Input
                id="follow_up"
                type="number"
                value={settings.follow_up_hours}
                onChange={(e) => setSettings({...settings, follow_up_hours: parseInt(e.target.value)})}
                className="card-glass border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="escalation">Escalation Time (hours)</Label>
              <Input
                id="escalation"
                type="number"
                value={settings.escalation_hours}
                onChange={(e) => setSettings({...settings, escalation_hours: parseInt(e.target.value)})}
                className="card-glass border-white/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto_reply">Auto-reply Enabled</Label>
              <Switch
                id="auto_reply"
                checked={settings.auto_reply_enabled}
                onCheckedChange={(checked) => setSettings({...settings, auto_reply_enabled: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auto_reply_template">Auto-reply Template</Label>
              <Textarea
                id="auto_reply_template"
                value={settings.auto_reply_template}
                onChange={(e) => setSettings({...settings, auto_reply_template: e.target.value})}
                className="card-glass border-white/20"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="follow_up_template">Follow-up Template</Label>
              <Textarea
                id="follow_up_template"
                value={settings.follow_up_template}
                onChange={(e) => setSettings({...settings, follow_up_template: e.target.value})}
                className="card-glass border-white/20"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <Switch
                id="email_notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sms_notifications">SMS Notifications</Label>
              <Switch
                id="sms_notifications"
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => setSettings({...settings, sms_notifications: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slack_webhook">Slack Webhook URL</Label>
              <Input
                id="slack_webhook"
                placeholder="https://hooks.slack.com/..."
                value={settings.slack_webhook}
                onChange={(e) => setSettings({...settings, slack_webhook: e.target.value})}
                className="card-glass border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegram_token">Telegram Bot Token</Label>
              <Input
                id="telegram_token"
                placeholder="Bot token..."
                value={settings.telegram_bot_token}
                onChange={(e) => setSettings({...settings, telegram_bot_token: e.target.value})}
                className="card-glass border-white/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Aircraft Categories */}
        <Card className="card-glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-purple-600" />
              Aircraft Categories & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings.aircraft_categories.map((category, index) => (
                <Card key={index} className="card-glass border-white/20">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input
                          value={category.name}
                          onChange={(e) => {
                            const newCategories = [...settings.aircraft_categories];
                            newCategories[index].name = e.target.value;
                            setSettings({...settings, aircraft_categories: newCategories});
                          }}
                          className="card-glass border-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Rate ($/hr)</Label>
                        <Input
                          type="number"
                          value={category.hourly_rate_min}
                          onChange={(e) => {
                            const newCategories = [...settings.aircraft_categories];
                            newCategories[index].hourly_rate_min = parseInt(e.target.value);
                            setSettings({...settings, aircraft_categories: newCategories});
                          }}
                          className="card-glass border-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Rate ($/hr)</Label>
                        <Input
                          type="number"
                          value={category.hourly_rate_max}
                          onChange={(e) => {
                            const newCategories = [...settings.aircraft_categories];
                            newCategories[index].hourly_rate_max = parseInt(e.target.value);
                            setSettings({...settings, aircraft_categories: newCategories});
                          }}
                          className="card-glass border-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cruise Speed (kts)</Label>
                        <Input
                          type="number"
                          value={category.cruise_speed}
                          onChange={(e) => {
                            const newCategories = [...settings.aircraft_categories];
                            newCategories[index].cruise_speed = parseInt(e.target.value);
                            setSettings({...settings, aircraft_categories: newCategories});
                          }}
                          className="card-glass border-white/20"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outline"
                onClick={() => setSettings({
                  ...settings,
                  aircraft_categories: [
                    ...settings.aircraft_categories,
                    { name: "New Category", hourly_rate_min: 2000, hourly_rate_max: 3000, cruise_speed: 400 }
                  ]
                })}
                className="card-glass border-white/20"
              >
                Add Category
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Tier Settings */}
        <Card className="card-glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Client Tier Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Define client tier levels based on completed flights or total revenue. Clients are automatically upgraded when they meet either threshold.
            </p>
            <div className="space-y-4">
              {settings.client_tiers.map((tier, index) => {
                const TierIcon = tier.id === 'elite' ? Crown : tier.id === 'retainer' ? Star : User;
                return (
                  <Card key={tier.id} className="card-glass border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: tier.color }}
                        >
                          <TierIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                          <div className="space-y-2">
                            <Label>Tier Name</Label>
                            <Input
                              value={tier.name}
                              onChange={(e) => {
                                const newTiers = [...settings.client_tiers];
                                newTiers[index].name = e.target.value;
                                setSettings({...settings, client_tiers: newTiers});
                              }}
                              className="card-glass border-white/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Min Flights</Label>
                            <Input
                              type="number"
                              min="0"
                              value={tier.min_flights}
                              onChange={(e) => {
                                const newTiers = [...settings.client_tiers];
                                newTiers[index].min_flights = parseInt(e.target.value) || 0;
                                setSettings({...settings, client_tiers: newTiers});
                              }}
                              className="card-glass border-white/20"
                              disabled={tier.id === 'new'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Min Revenue ($)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={tier.min_revenue}
                              onChange={(e) => {
                                const newTiers = [...settings.client_tiers];
                                newTiers[index].min_revenue = parseInt(e.target.value) || 0;
                                setSettings({...settings, client_tiers: newTiers});
                              }}
                              className="card-glass border-white/20"
                              disabled={tier.id === 'new'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={tier.color}
                                onChange={(e) => {
                                  const newTiers = [...settings.client_tiers];
                                  newTiers[index].color = e.target.value;
                                  setSettings({...settings, client_tiers: newTiers});
                                }}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={tier.color}
                                onChange={(e) => {
                                  const newTiers = [...settings.client_tiers];
                                  newTiers[index].color = e.target.value;
                                  setSettings({...settings, client_tiers: newTiers});
                                }}
                                className="card-glass border-white/20 flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Rules */}
        <Card className="card-glass lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600" />
                Priority Rules
              </CardTitle>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1A1A1A] hover:bg-[#333]">
                    <Plus className="w-4 h-4 mr-2" />
                    New Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="card-glass max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Priority Rule</DialogTitle>
                  </DialogHeader>
                  <RuleForm 
                    rule={null} 
                    onSave={() => { setShowCreateDialog(false); loadRules(); }}
                    onCancel={() => setShowCreateDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Default Rules Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-red-600" />
                  <Badge className="bg-red-100 text-red-800 text-xs">HOT</Badge>
                </div>
                <p className="text-sm text-gray-700">Flights departing within 48 hours</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">WARM</Badge>
                </div>
                <p className="text-sm text-gray-700">Standard lead processing</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <SettingsIcon className="w-4 h-4 text-blue-600" />
                  <Badge className="bg-blue-100 text-blue-800 text-xs">COLD</Badge>
                </div>
                <p className="text-sm text-gray-700">Inactive for 72+ hours</p>
              </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card key={rule.id} className="card-glass border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                          <Badge className={`${priorityRuleColors[rule.priority]} border text-xs`}>
                            {rule.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ruleTypeLabels[rule.rule_type]}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{getRuleDescription(rule)}</div>
                        <div className="text-xs text-gray-400">Order: {rule.order}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.active} onCheckedChange={(checked) => toggleRule(rule.id, checked)} />
                        <Button variant="ghost" size="icon" onClick={() => setEditingRule(rule)} className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="h-8 w-8 text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {rules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <SettingsIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No priority rules configured</p>
                  <p className="text-sm">Create rules to automatically assign lead priorities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Edit Rule Dialog */}
      {editingRule && (
        <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
          <DialogContent className="card-glass max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Priority Rule</DialogTitle>
            </DialogHeader>
            <RuleForm 
              rule={editingRule} 
              onSave={() => { setEditingRule(null); loadRules(); }}
              onCancel={() => setEditingRule(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}