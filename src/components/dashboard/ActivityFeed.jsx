import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Activity, 
  Phone, 
  Mail, 
  FileText, 
  UserCheck,
  DollarSign,
  Clock,
  Filter,
  UserPlus,
  ArrowRightLeft,
  Crown,
  Star,
  User
} from "lucide-react";
import { format } from "date-fns";

const clientTierConfig = {
  new: { label: "New", icon: User, color: "bg-gray-100 text-gray-700" },
  retainer: { label: "Retainer", icon: Star, color: "bg-blue-100 text-blue-700" },
  elite: { label: "Elite", icon: Crown, color: "bg-amber-100 text-amber-700" }
};

export default function ActivityFeed({ leads }) {
  const [filters, setFilters] = useState({
    clientTier: "all",
    activityType: "all",
    timeRange: "all"
  });

  // Generate activity data from leads
  const getRecentActivity = () => {
    const activities = [];
    
    leads.slice(0, 20).forEach(lead => {
      activities.push({
        id: `${lead.id}-created`,
        type: 'lead_created',
        lead_id: lead.id,
        client_name: lead.client?.full_name,
        client_tier: lead.client?.client_tier || 'new',
        timestamp: lead.created_date,
        status: lead.status,
        priority: lead.priority
      });
      
      if (lead.status !== 'new') {
        activities.push({
          id: `${lead.id}-status`,
          type: 'status_change',
          lead_id: lead.id,
          client_name: lead.client?.full_name,
          client_tier: lead.client?.client_tier || 'new',
          timestamp: lead.updated_date || lead.created_date,
          status: lead.status,
          priority: lead.priority
        });
      }

      if (lead.status === 'booked' || lead.status === 'flown') {
        activities.push({
          id: `${lead.id}-booked`,
          type: 'booking',
          lead_id: lead.id,
          client_name: lead.client?.full_name,
          client_tier: lead.client?.client_tier || 'new',
          timestamp: lead.updated_date || lead.created_date,
          status: lead.status,
          priority: lead.priority,
          amount: lead.client_closing_price
        });
      }
    });
    
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const allActivities = getRecentActivity();

  // Apply filters
  const filteredActivities = allActivities.filter(activity => {
    if (filters.clientTier !== "all" && activity.client_tier !== filters.clientTier) {
      return false;
    }
    if (filters.activityType !== "all" && activity.type !== filters.activityType) {
      return false;
    }
    if (filters.timeRange !== "all") {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      if (filters.timeRange === "today") {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        if (activityDate < startOfDay) return false;
      } else if (filters.timeRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (activityDate < weekAgo) return false;
      } else if (filters.timeRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (activityDate < monthAgo) return false;
      }
    }
    return true;
  }).slice(0, 15);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lead_created':
        return <UserPlus className="w-4 h-4" />;
      case 'status_change':
        return <ArrowRightLeft className="w-4 h-4" />;
      case 'booking':
        return <DollarSign className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'quote':
        return <FileText className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'lead_created':
        return "bg-blue-500";
      case 'status_change':
        return "bg-purple-500";
      case 'booking':
        return "bg-green-500";
      case 'call':
        return "bg-amber-500";
      case 'email':
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'lead_created':
        return `New lead received`;
      case 'status_change':
        return `Status changed to ${activity.status.replace('_', ' ')}`;
      case 'booking':
        return `Flight booked${activity.amount ? ` - $${activity.amount.toLocaleString()}` : ''}`;
      default:
        return 'Activity logged';
    }
  };

  const TierIcon = ({ tier }) => {
    const config = clientTierConfig[tier] || clientTierConfig.new;
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} rounded-md text-xs font-medium`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="bg-white border-[#E5DFD5] rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <CardTitle className="flex items-center justify-between text-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1A1A1A]" />
              Recent Activity
            </div>
            <Badge variant="outline" className="bg-[#F5F2EC] border-[#E5DFD5] text-[#1A1A1A] rounded-md">
              {filteredActivities.length} activities
            </Badge>
          </CardTitle>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select 
              value={filters.clientTier} 
              onValueChange={(value) => setFilters({...filters, clientTier: value})}
            >
              <SelectTrigger className="w-[130px] h-9 bg-[#F5F2EC] border-[#E5DFD5] rounded-md text-sm">
                <SelectValue placeholder="Client Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="retainer">Retainer</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.activityType} 
              onValueChange={(value) => setFilters({...filters, activityType: value})}
            >
              <SelectTrigger className="w-[140px] h-9 bg-[#F5F2EC] border-[#E5DFD5] rounded-md text-sm">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="lead_created">New Leads</SelectItem>
                <SelectItem value="status_change">Status Changes</SelectItem>
                <SelectItem value="booking">Bookings</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.timeRange} 
              onValueChange={(value) => setFilters({...filters, timeRange: value})}
            >
              <SelectTrigger className="w-[120px] h-9 bg-[#F5F2EC] border-[#E5DFD5] rounded-md text-sm">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {(filters.clientTier !== "all" || filters.activityType !== "all" || filters.timeRange !== "all") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFilters({ clientTier: "all", activityType: "all", timeRange: "all" })}
                className="h-9 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E5DFD5]"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center gap-4 p-3 bg-[#F5F2EC] border border-[#E5DFD5] rounded-lg hover:border-[#1A1A1A] hover:shadow-sm transition-all"
            >
              {/* Activity Icon */}
              <div className={`w-10 h-10 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white">
                  {getActivityIcon(activity.type)}
                </span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#1A1A1A] truncate">
                    {activity.client_name || 'Unknown'}
                  </span>
                  <TierIcon tier={activity.client_tier} />
                </div>
                <p className="text-sm text-[#6B6B6B]">
                  {getActivityText(activity)}
                </p>
              </div>

              {/* Timestamp */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[#6B6B6B]">
                  {format(new Date(activity.timestamp), 'MMM d')}
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  {format(new Date(activity.timestamp), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-[#6B6B6B]">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No activities found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}