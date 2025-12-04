import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lead, User as UserEntity } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  ArrowRight,
  Users as UsersIcon,
  DollarSign,
  Clock,
  Phone,
  Mail,
  Calendar,
  Plane,
  MessageSquare,
  FileText,
  Edit,
  Star,
  Globe,
  Save,
  Upload,
  Trash2,
  Crown,
  User,
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  qualified: "bg-purple-100 text-purple-700 border-purple-200",
  quoted: "bg-indigo-100 text-indigo-700 border-indigo-200",
  pending_client: "bg-orange-100 text-orange-700 border-orange-200",
  booked: "bg-green-100 text-green-700 border-green-200",
  flown: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-gray-100 text-gray-700 border-gray-200"
};

const priorityColors = {
  hot: "bg-red-100 text-red-700 border-red-200",
  warm: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cold: "bg-blue-100 text-blue-700 border-blue-200"
};

const clientTierConfig = {
  new: { label: 'New', icon: User, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  retainer: { label: 'Retainer', icon: Star, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  elite: { label: 'Elite', icon: Crown, color: 'bg-amber-100 text-amber-700 border-amber-200' }
};

const demoOperators = ['NetJets', 'VistaJet', 'Flexjet', 'Wheels Up', 'XO', 'Other'];

const aircraftTypes = {
  'Light Jets': [
    'Citation CJ2', 'Citation CJ3', 'Citation CJ4', 'Citation M2', 'Citation Mustang',
    'Phenom 100', 'Phenom 300', 'HondaJet', 'Learjet 40', 'Learjet 45',
    'Pilatus PC-24', 'Eclipse 500'
  ],
  'Midsize Jets': [
    'Citation XLS', 'Citation XLS+', 'Citation Latitude', 'Citation Sovereign',
    'Hawker 800XP', 'Hawker 900XP', 'Learjet 60', 'Learjet 75',
    'Gulfstream G150', 'Falcon 50'
  ],
  'Super Midsize Jets': [
    'Citation X', 'Citation X+', 'Citation Longitude',
    'Challenger 350', 'Challenger 300', 'Gulfstream G280',
    'Falcon 900', 'Falcon 900LX', 'Legacy 500', 'Legacy 450', 'Praetor 500', 'Praetor 600'
  ],
  'Heavy Jets': [
    'Challenger 604', 'Challenger 605', 'Challenger 650',
    'Gulfstream G450', 'Gulfstream GIV', 'Gulfstream GIV-SP',
    'Falcon 2000', 'Falcon 2000LX', 'Falcon 7X', 'Falcon 8X',
    'Legacy 600', 'Legacy 650', 'Global 5000', 'Embraer Lineage 1000'
  ],
  'Ultra Long Range': [
    'Gulfstream G550', 'Gulfstream G650', 'Gulfstream G650ER', 'Gulfstream G700', 'Gulfstream G800',
    'Global 6000', 'Global 6500', 'Global 7500', 'Global 8000',
    'Falcon 7X', 'Falcon 8X', 'Bombardier Global Express'
  ]
};

const getCountryFromPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  const countryMappings = {
    '+1': 'US', '+44': 'UK', '+33': 'FR', '+49': 'DE', '+39': 'IT',
    '+34': 'ES', '+41': 'CH', '+971': 'UAE', '+966': 'SA', '+974': 'QA'
  };
  for (const [code, country] of Object.entries(countryMappings)) {
    if (phoneNumber.startsWith(code)) return country;
  }
  return null;
};

export default function LeadDetailModal({ lead, isOpen, onClose, onLeadUpdate }) {
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusNote, setStatusNote] = useState("");
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // 'client', 'flight', 'financials', 'operator'
  const [showCallNoteModal, setShowCallNoteModal] = useState(false);
  const [callNote, setCallNote] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [usersList, me] = await Promise.all([
          UserEntity.list(),
          UserEntity.currentUser()
        ]);
        setUsers(usersList);
        setCurrentUser(me);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadData();
  }, []);

  React.useEffect(() => {
    if (lead) {
      setEditedLead(lead);
    }
  }, [lead]);

  if (!lead) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Lead.update(lead.id, editedLead);
      setIsEditing(false);
      setEditingSection(null);
      onLeadUpdate();
    } catch (error) {
      console.error('Error saving lead:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedLead(lead);
    setIsEditing(false);
    setEditingSection(null);
  };

  const handleSectionSave = async (section) => {
    setIsSaving(true);
    try {
      await Lead.update(lead.id, editedLead);
      setEditingSection(null);
      onLeadUpdate();
    } catch (error) {
      console.error('Error saving lead:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionCancel = () => {
    setEditedLead(lead);
    setEditingSection(null);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const currentNotes = lead.notes || [];
      const updatedNotes = [
        ...currentNotes,
        { user_id: "current_user", text: newNote, timestamp: new Date().toISOString() }
      ];
      await Lead.update(lead.id, { notes: updatedNotes });
      setNewNote("");
      onLeadUpdate();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setPendingStatus(newStatus);
    setStatusNote("");
  };

  const confirmStatusChange = async () => {
    if (!statusNote.trim() || !pendingStatus) return;
    setIsSaving(true);
    try {
      const currentNotes = lead.notes || [];
      const statusLabels = {
        new: 'New', contacted: 'Contacted', qualified: 'Qualified',
        quoted: 'Quoted', pending_client: 'Pending Client',
        booked: 'Booked', flown: 'Flown', lost: 'Lost'
      };
      const newNote = {
        user_id: "current_user",
        text: `Status changed to "${statusLabels[pendingStatus]}": ${statusNote}`,
        timestamp: new Date().toISOString()
      };
      const updatedNotes = [...currentNotes, newNote];
      await Lead.update(lead.id, { status: pendingStatus, notes: updatedNotes });
      // Update local state immediately
      setEditedLead(prev => ({ ...prev, status: pendingStatus, notes: updatedNotes }));
      setPendingStatus(null);
      setStatusNote("");
      onLeadUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentLead = editedLead.id ? editedLead : lead;
  const profit = (currentLead.client_closing_price || 0) - (currentLead.operator_closing_price || 0);
  const profitMargin = currentLead.client_closing_price ? (profit / currentLead.client_closing_price) * 100 : 0;
  const leg = currentLead.trip?.legs?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-[#1A1A1A] border-0 p-0 rounded-2xl shadow-2xl [&>button]:top-4 [&>button]:right-4 [&>button]:text-white [&>button]:bg-white/20 [&>button]:rounded-full [&>button]:w-8 [&>button]:h-8 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:hover:bg-white/30 [&>button]:transition-all [&>button]:z-50">
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="text-xl font-bold">
                    {currentLead.client?.full_name || 'Unknown Client'}
                  </h2>

                  {/* Clickable Status Badge */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`${statusColors[currentLead.status]} border text-xs cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold`}>
                        {currentLead.status.replace('_', ' ')}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {['new', 'contacted', 'qualified', 'quoted', 'pending_client', 'booked', 'flown', 'lost'].map(s => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={currentLead.status === s ? 'bg-gray-100' : ''}
                        >
                          {s.replace('_', ' ')}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Clickable Priority Badge */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`${priorityColors[currentLead.priority]} border text-xs cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold`}>
                        {currentLead.priority === 'hot' && <Star className="w-3 h-3 mr-1" />}
                        {currentLead.priority}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {['hot', 'warm', 'cold'].map(p => (
                        <DropdownMenuItem
                          key={p}
                          onClick={async () => {
                            await Lead.update(lead.id, { priority: p });
                            setEditedLead(prev => ({ ...prev, priority: p }));
                            onLeadUpdate();
                          }}
                          className={currentLead.priority === p ? 'bg-gray-100' : ''}
                        >
                          {p === 'hot' && '🔥 '}{p}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Clickable Client Tier Badge */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`${clientTierConfig[currentLead.client?.client_tier || 'new']?.color || clientTierConfig.new.color} border text-xs cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold`}>
                        {(() => {
                          const tier = currentLead.client?.client_tier || 'new';
                          const config = clientTierConfig[tier] || clientTierConfig.new;
                          const TierIcon = config.icon;
                          return (
                            <>
                              <TierIcon className="w-3 h-3 mr-1" />
                              {config.label}
                            </>
                          );
                        })()}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {Object.entries(clientTierConfig).map(([key, config]) => {
                        const TierIcon = config.icon;
                        return (
                          <DropdownMenuItem
                            key={key}
                            onClick={async () => {
                              await Lead.update(lead.id, { client: { ...currentLead.client, client_tier: key } });
                              setEditedLead(prev => ({ ...prev, client: { ...prev.client, client_tier: key } }));
                              onLeadUpdate();
                            }}
                            className={currentLead.client?.client_tier === key ? 'bg-gray-100' : ''}
                          >
                            <TierIcon className="w-3 h-3 mr-2" />
                            {config.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {leg && (
                    <span className="text-gray-300 text-sm font-mono">
                      {leg.from_iata} → {leg.to_iata}
                    </span>
                  )}
                  {leg?.depart_iso && (
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      {format(new Date(leg.depart_iso), 'MMM d, yyyy')}
                    </span>
                  )}
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Req: {format(new Date(currentLead.created_date), 'MMM d')}
                  </span>
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving} className="text-black text-xs h-6 px-2">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-xs h-6 px-2">
                        <Save className="w-3 h-3 mr-1" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Badge className="bg-white/20 text-white border-white/30 cursor-pointer hover:bg-white/30 transition-all" onClick={() => setIsEditing(true)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full bg-gradient-to-br from-[#F9F7F4] to-[#F0EDE8]">
            <TabsList className="w-full justify-start bg-white/50 border-b border-[#E5DFD5]/50 rounded-none p-0 h-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/80 data-[state=active]:border-b-2 data-[state=active]:border-[#1A1A1A] data-[state=active]:shadow-none bg-transparent rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-[#6B6B6B] data-[state=active]:text-[#1A1A1A] transition-all">
                Overview
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="data-[state=active]:bg-white/80 data-[state=active]:border-b-2 data-[state=active]:border-[#1A1A1A] data-[state=active]:shadow-none bg-transparent rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-[#6B6B6B] data-[state=active]:text-[#1A1A1A] transition-all">
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-white/80 data-[state=active]:border-b-2 data-[state=active]:border-[#1A1A1A] data-[state=active]:shadow-none bg-transparent rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-[#6B6B6B] data-[state=active]:text-[#1A1A1A] transition-all">
                Notes & Files
              </TabsTrigger>
            </TabsList>

            {/* PIPELINE TAB */}
            <TabsContent value="pipeline" className="p-5 space-y-5 m-0">
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-6 rounded-xl shadow-sm">
                <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-6">Lead Progress</h3>

                {/* Pipeline Visual */}
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-[#E5DFD5] rounded-full" />
                  <div
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, (['new', 'contacted', 'qualified', 'quoted', 'pending_client', 'booked', 'flown', 'lost'].indexOf(currentLead.status) / 6) * 100)}%`
                    }}
                  />

                  {/* Stages */}
                  <div className="flex justify-between relative">
                    {[
                      { id: 'new', label: 'New', color: 'bg-blue-500' },
                      { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
                      { id: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
                      { id: 'quoted', label: 'Quoted', color: 'bg-indigo-500' },
                      { id: 'pending_client', label: 'Pending', color: 'bg-orange-500' },
                      { id: 'booked', label: 'Booked', color: 'bg-green-500' },
                      { id: 'flown', label: 'Flown', color: 'bg-emerald-500' }
                    ].map((stage, index) => {
                      const currentIndex = ['new', 'contacted', 'qualified', 'quoted', 'pending_client', 'booked', 'flown'].indexOf(currentLead.status);
                      const isActive = currentLead.status === stage.id;
                      const isPast = index < currentIndex;
                      const isLost = currentLead.status === 'lost';

                      return (
                        <div key={stage.id} className="flex flex-col items-center z-10">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive
                                ? `${stage.color} border-white shadow-lg scale-110`
                                : isPast
                                  ? `${stage.color} border-white opacity-60`
                                  : isLost
                                    ? 'bg-gray-300 border-gray-200'
                                    : 'bg-white border-[#E5DFD5]'
                              }`}
                          >
                            {(isActive || isPast) && !isLost && (
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-[10px] mt-2 font-medium text-center ${isActive ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lost Status */}
                {currentLead.status === 'lost' && (
                  <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200 text-center">
                    <span className="text-gray-600 font-medium">Lead Lost</span>
                  </div>
                )}
              </div>

              {/* Last Update */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider">Last Update</h3>
                  {currentLead.notes?.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAllUpdates(true)}
                      className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A]"
                    >
                      View All ({currentLead.notes.length})
                    </Button>
                  )}
                </div>
                {currentLead.notes?.length > 0 ? (
                  <div className="p-3 bg-gradient-to-r from-[#F5F2EC] to-[#F9F7F4] rounded-lg border border-[#E5DFD5]/30">
                    <p className="text-sm text-[#1A1A1A]">{currentLead.notes[currentLead.notes.length - 1].text}</p>
                    <p className="text-[10px] text-[#6B6B6B] mt-2">
                      {format(new Date(currentLead.notes[currentLead.notes.length - 1].timestamp), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#6B6B6B]">No updates yet</p>
                )}
              </div>

              {/* All Updates Modal */}
              {showAllUpdates && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowAllUpdates(false)}>
                  <div className="bg-white rounded-xl max-w-lg w-full max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-[#E5DFD5] flex items-center justify-between">
                      <h3 className="font-semibold text-[#1A1A1A]">All Updates ({currentLead.notes?.length || 0})</h3>
                      <Button size="sm" variant="ghost" onClick={() => setShowAllUpdates(false)}>✕</Button>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(70vh-60px)]">
                      {currentLead.notes?.slice().reverse().map((note, index) => (
                        <div key={index} className="p-3 bg-gradient-to-r from-[#F5F2EC] to-[#F9F7F4] rounded-lg border border-[#E5DFD5]/30">
                          <p className="text-sm text-[#1A1A1A]">{note.text}</p>
                          <p className="text-[10px] text-[#6B6B6B] mt-2">
                            {format(new Date(note.timestamp), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Change Buttons */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm">
                <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Quick Status Update</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'new', label: 'New', color: 'bg-blue-500 hover:bg-blue-600' },
                    { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500 hover:bg-yellow-600' },
                    { id: 'qualified', label: 'Qualified', color: 'bg-purple-500 hover:bg-purple-600' },
                    { id: 'quoted', label: 'Quoted', color: 'bg-indigo-500 hover:bg-indigo-600' },
                    { id: 'pending_client', label: 'Pending', color: 'bg-orange-500 hover:bg-orange-600' },
                    { id: 'booked', label: 'Booked', color: 'bg-green-500 hover:bg-green-600' },
                    { id: 'flown', label: 'Flown', color: 'bg-emerald-500 hover:bg-emerald-600' },
                    { id: 'lost', label: 'Lost', color: 'bg-gray-500 hover:bg-gray-600' }
                  ].map((status) => (
                    <Button
                      key={status.id}
                      size="sm"
                      disabled={currentLead.status === status.id}
                      className={`${currentLead.status === status.id ? status.color + ' text-white' : 'bg-white border border-[#E5DFD5] text-[#6B6B6B] hover:bg-[#F5F2EC]'} transition-all`}
                      onClick={() => handleStatusChange(status.id)}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Change Modal */}
              {pendingStatus && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setPendingStatus(null)}>
                  <div className="bg-white rounded-xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-[#E5DFD5] flex items-center justify-between">
                      <h3 className="font-semibold text-[#1A1A1A]">Change Status</h3>
                      <Button size="sm" variant="ghost" onClick={() => setPendingStatus(null)}>✕</Button>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-[#1A1A1A] mb-3">
                        Why are you changing status to "<span className="capitalize">{pendingStatus.replace('_', ' ')}</span>"?
                      </p>
                      <Textarea
                        placeholder="Enter reason for status change..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="border-[#E5DFD5] min-h-[100px] mb-4"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPendingStatus(null)}
                          className="border-[#E5DFD5]"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={confirmStatusChange}
                          disabled={!statusNote.trim() || isSaving}
                          className="bg-[#1A1A1A] hover:bg-[#333] text-white"
                        >
                          {isSaving ? 'Saving...' : 'Confirm'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="p-5 space-y-5 m-0">
              {/* Client & Contact Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm relative group">
                  {editingSection !== 'client' && !isEditing && (
                    <button
                      onClick={() => setEditingSection('client')}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#1A1A1A]/10 hover:bg-[#1A1A1A]/20"
                    >
                      <Edit className="w-3 h-3 text-[#6B6B6B]" />
                    </button>
                  )}
                  <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Client</h3>
                  {isEditing || editingSection === 'client' ? (
                    <div className="space-y-3">
                      <Input
                        value={editedLead.client?.full_name || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, client: { ...editedLead.client, full_name: e.target.value } })}
                        placeholder="Full Name"
                        className="border-[#E5DFD5]/50 rounded-lg"
                      />
                      <Input
                        value={editedLead.client?.email || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, client: { ...editedLead.client, email: e.target.value } })}
                        placeholder="Email"
                        className="border-[#E5DFD5]/50 rounded-lg"
                      />
                      <Input
                        value={editedLead.client?.phone_e164 || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, client: { ...editedLead.client, phone_e164: e.target.value } })}
                        placeholder="Phone"
                        className="border-[#E5DFD5]/50 rounded-lg"
                      />
                      {editingSection === 'client' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={handleSectionCancel} className="flex-1">Cancel</Button>
                          <Button size="sm" onClick={() => handleSectionSave('client')} disabled={isSaving} className="flex-1 bg-[#1A1A1A] text-white">
                            {isSaving ? '...' : 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-semibold text-[#1A1A1A]">{currentLead.client?.full_name}</p>
                      <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                        <Mail className="w-3 h-3" />
                        <span>{currentLead.client?.email}</span>
                      </div>
                      {currentLead.client?.phone_e164 && (
                        <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                          <Phone className="w-3 h-3" />
                          <span>{currentLead.client.phone_e164}</span>
                          {getCountryFromPhoneNumber(currentLead.client.phone_e164) && (
                            <Badge variant="outline" className="text-[10px]">
                              {getCountryFromPhoneNumber(currentLead.client.phone_e164)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm relative group">
                  <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Quick Actions</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white relative"
                      onClick={() => setShowCallNoteModal(true)}
                      disabled={!currentLead.client?.phone_e164}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call Center
                      {(currentLead.notes || []).filter(n => n.text?.includes('📞 Call Note:')).length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-white text-green-700 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-green-600">
                          {(currentLead.notes || []).filter(n => n.text?.includes('📞 Call Note:')).length}
                        </span>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#1A1A1A]"
                      onClick={() => window.open(`mailto:${currentLead.client?.email}`)}
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>

              {/* Assignment Row (Admin Only) */}
              {currentUser?.role === 'admin' && (
                <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm relative group">
                  <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Assignment</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-[#6B6B6B] mb-1 block">Assigned Broker</Label>
                      <Select
                        value={editedLead.owner_user_id || "unassigned"}
                        onValueChange={async (userId) => {
                          const selectedUser = users.find(u => u.id === userId);
                          if (selectedUser) {
                            await Lead.update(lead.id, {
                              owner_user_id: selectedUser.id,
                              owner_email: selectedUser.email,
                              owner_name: selectedUser.full_name
                            });
                            setEditedLead(prev => ({
                              ...prev,
                              owner_user_id: selectedUser.id,
                              owner_email: selectedUser.email,
                              owner_name: selectedUser.full_name
                            }));
                            onLeadUpdate();
                          }
                        }}
                      >
                        <SelectTrigger className="border-[#E5DFD5] bg-white">
                          <SelectValue placeholder="Select Broker" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Priority Row */}
              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm">
                    <Label className="text-xs text-[#6B6B6B]">Status</Label>
                    <Select value={editedLead.status} onValueChange={(v) => setEditedLead({ ...editedLead, status: v })}>
                      <SelectTrigger className="mt-1 border-[#E5DFD5]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['new', 'contacted', 'qualified', 'quoted', 'pending_client', 'booked', 'flown', 'lost'].map(s => (
                          <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm">
                    <Label className="text-xs text-[#6B6B6B]">Priority</Label>
                    <Select value={editedLead.priority} onValueChange={(v) => setEditedLead({ ...editedLead, priority: v })}>
                      <SelectTrigger className="mt-1 border-[#E5DFD5]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">Hot</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cold">Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Flight Details */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm relative group">
                {editingSection !== 'flight' && !isEditing && (
                  <button
                    onClick={() => setEditingSection('flight')}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#1A1A1A]/10 hover:bg-[#1A1A1A]/20"
                  >
                    <Edit className="w-3 h-3 text-[#6B6B6B]" />
                  </button>
                )}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider">Flight Details</h3>
                  <div className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                    <Clock className="w-3 h-3" />
                    <span>Requested: {format(new Date(currentLead.created_date), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>

                {currentLead.trip?.legs?.map((leg, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    {isEditing || editingSection === 'flight' ? (
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <Label className="text-[10px] text-[#6B6B6B]">From</Label>
                          <Input
                            value={leg.from_iata || ''}
                            onChange={(e) => {
                              const newLegs = [...editedLead.trip.legs];
                              newLegs[index] = { ...newLegs[index], from_iata: e.target.value };
                              setEditedLead({ ...editedLead, trip: { ...editedLead.trip, legs: newLegs } });
                            }}
                            className="border-[#E5DFD5] font-mono"
                            placeholder="IATA"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-[#6B6B6B]">To</Label>
                          <Input
                            value={leg.to_iata || ''}
                            onChange={(e) => {
                              const newLegs = [...editedLead.trip.legs];
                              newLegs[index] = { ...newLegs[index], to_iata: e.target.value };
                              setEditedLead({ ...editedLead, trip: { ...editedLead.trip, legs: newLegs } });
                            }}
                            className="border-[#E5DFD5] font-mono"
                            placeholder="IATA"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-[#6B6B6B]">Departure</Label>
                          <Input
                            type="datetime-local"
                            value={leg.depart_iso ? new Date(leg.depart_iso).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                              const newLegs = [...editedLead.trip.legs];
                              newLegs[index] = { ...newLegs[index], depart_iso: new Date(e.target.value).toISOString() };
                              setEditedLead({ ...editedLead, trip: { ...editedLead.trip, legs: newLegs } });
                            }}
                            className="border-[#E5DFD5] text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-[#6B6B6B]">Pax</Label>
                          <Input
                            type="number"
                            min="1"
                            value={editedLead.trip?.pax || ''}
                            onChange={(e) => setEditedLead({ ...editedLead, trip: { ...editedLead.trip, pax: parseInt(e.target.value) || 1 } })}
                            className="border-[#E5DFD5]/50 rounded-lg"
                          />
                        </div>
                        {editingSection === 'flight' && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={handleSectionCancel} className="flex-1">Cancel</Button>
                            <Button size="sm" onClick={() => handleSectionSave('flight')} disabled={isSaving} className="flex-1 bg-[#1A1A1A] text-white">
                              {isSaving ? '...' : 'Save'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <span className="font-mono font-bold text-lg block">{leg.from_iata}</span>
                              {(leg.from_name || leg.from_city) && (
                                <span className="text-[10px] text-[#6B6B6B] block max-w-[140px] truncate">
                                  {leg.from_name || leg.from_city}{leg.from_country ? `, ${leg.from_country}` : ''}
                                </span>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#6B6B6B]" />
                            <div className="text-center">
                              <span className="font-mono font-bold text-lg block">{leg.to_iata}</span>
                              {(leg.to_name || leg.to_city) && (
                                <span className="text-[10px] text-[#6B6B6B] block max-w-[140px] truncate">
                                  {leg.to_name || leg.to_city}{leg.to_country ? `, ${leg.to_country}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          {currentLead.trip?.type === 'round_trip' && index === 0 && (
                            <Badge variant="outline" className="text-[10px]">Round Trip</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#6B6B6B]">
                          {leg.depart_iso && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(leg.depart_iso), 'MMM d, HH:mm')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" />
                            <span>{currentLead.trip?.pax || 0} pax</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Financials */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm relative group">
                {editingSection !== 'financials' && !isEditing && (
                  <button
                    onClick={() => setEditingSection('financials')}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#1A1A1A]/10 hover:bg-[#1A1A1A]/20"
                  >
                    <Edit className="w-3 h-3 text-[#6B6B6B]" />
                  </button>
                )}
                <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Financials</h3>

                {isEditing || editingSection === 'financials' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] text-[#6B6B6B]">Client Price</Label>
                      <Input
                        type="number"
                        value={editedLead.client_closing_price || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, client_closing_price: parseFloat(e.target.value) || null })}
                        className="border-[#E5DFD5]/50 rounded-lg"
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-[#6B6B6B]">Operator Cost</Label>
                      <Input
                        type="number"
                        value={editedLead.operator_closing_price || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, operator_closing_price: parseFloat(e.target.value) || null })}
                        className="border-[#E5DFD5]/50 rounded-lg"
                        placeholder="$0"
                      />
                    </div>
                    {editingSection === 'financials' && (
                      <div className="col-span-2 flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={handleSectionCancel} className="flex-1">Cancel</Button>
                        <Button size="sm" onClick={() => handleSectionSave('financials')} disabled={isSaving} className="flex-1 bg-[#1A1A1A] text-white">
                          {isSaving ? '...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-[#F5F2EC]/80 rounded-lg">
                      <p className="text-[10px] text-[#6B6B6B] uppercase">Estimate</p>
                      <p className="font-semibold text-[#1A1A1A]">
                        {currentLead.estimate?.price_min && currentLead.estimate?.price_max
                          ? `$${(currentLead.estimate.price_min / 1000).toFixed(0)}k-${(currentLead.estimate.price_max / 1000).toFixed(0)}k`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-[#F5F2EC]/80 rounded-lg">
                      <p className="text-[10px] text-[#6B6B6B] uppercase">Client Price</p>
                      <p className="font-semibold text-[#1A1A1A]">
                        {currentLead.client_closing_price ? `$${currentLead.client_closing_price.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-[#F5F2EC]/80 rounded-lg">
                      <p className="text-[10px] text-[#6B6B6B] uppercase">Operator</p>
                      <p className="font-semibold text-[#1A1A1A]">
                        {currentLead.operator_closing_price ? `$${currentLead.operator_closing_price.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                      <p className="text-[10px] text-green-700 uppercase">Profit</p>
                      <p className="font-bold text-green-600">
                        {profit > 0 ? `$${profit.toLocaleString()}` : 'N/A'}
                      </p>
                      {profit > 0 && <p className="text-[10px] text-green-600">{profitMargin.toFixed(1)}%</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Operator */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm relative group">
                {editingSection !== 'operator' && !isEditing && (
                  <button
                    onClick={() => setEditingSection('operator')}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#1A1A1A]/10 hover:bg-[#1A1A1A]/20"
                  >
                    <Edit className="w-3 h-3 text-[#6B6B6B]" />
                  </button>
                )}
                <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Operator & Aircraft</h3>

                {isEditing || editingSection === 'operator' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[10px] text-[#6B6B6B]">Operator</Label>
                      <Select
                        value={editedLead.operational_details?.operator_name || ''}
                        onValueChange={(v) => setEditedLead({ ...editedLead, operational_details: { ...editedLead.operational_details, operator_name: v } })}
                      >
                        <SelectTrigger className="border-[#E5DFD5]/50 rounded-lg"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {demoOperators.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-[#6B6B6B]">Aircraft Type</Label>
                      <Select
                        value={editedLead.operational_details?.aircraft_type || ''}
                        onValueChange={(v) => setEditedLead({ ...editedLead, operational_details: { ...editedLead.operational_details, aircraft_type: v } })}
                      >
                        <SelectTrigger className="border-[#E5DFD5]/50 rounded-lg"><SelectValue placeholder="Select aircraft" /></SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Object.entries(aircraftTypes).map(([category, jets]) => (
                            <div key={category}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-[#6B6B6B] bg-[#F5F2EC]">{category}</div>
                              {jets.map(jet => <SelectItem key={jet} value={jet}>{jet}</SelectItem>)}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-[#6B6B6B]">Tail Number</Label>
                      <Input
                        value={editedLead.operational_details?.tail_number || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, operational_details: { ...editedLead.operational_details, tail_number: e.target.value } })}
                        className="border-[#E5DFD5]/50 rounded-lg"
                        placeholder="N123AB"
                      />
                    </div>
                    {editingSection === 'operator' && (
                      <div className="col-span-3 flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={handleSectionCancel} className="flex-1">Cancel</Button>
                        <Button size="sm" onClick={() => handleSectionSave('operator')} disabled={isSaving} className="flex-1 bg-[#1A1A1A] text-white">
                          {isSaving ? '...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] text-[#6B6B6B] uppercase">Operator</p>
                      <p className="font-semibold text-[#1A1A1A]">{currentLead.operational_details?.operator_name || 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6B6B6B] uppercase">Aircraft</p>
                      <p className="font-semibold text-[#1A1A1A]">{currentLead.operational_details?.aircraft_type || 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6B6B6B] uppercase">Tail #</p>
                      <p className="font-semibold text-[#1A1A1A]">{currentLead.operational_details?.tail_number || 'TBD'}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Call Center Modal */}
            {showCallNoteModal && (
              <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowCallNoteModal(false)}>
                <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 border-b border-[#E5DFD5] flex items-center justify-between bg-gradient-to-r from-green-600 to-green-700">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Call Center
                    </h3>
                    <Button size="sm" variant="ghost" onClick={() => setShowCallNoteModal(false)} className="text-white hover:bg-white/20">✕</Button>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
                    {/* Client Info & Call Button */}
                    <div className="bg-gradient-to-r from-[#F5F2EC] to-[#F9F7F4] rounded-xl p-4 mb-4 border border-[#E5DFD5]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1A1A1A] text-lg">{currentLead.client?.full_name}</p>
                          <p className="text-[#6B6B6B] text-sm">{currentLead.client?.phone_e164}</p>
                        </div>
                        <Button
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white px-6"
                          onClick={() => window.open(`tel:${currentLead.client?.phone_e164}`)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      </div>
                    </div>

                    {/* Previous Call Notes */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
                        Call History ({(currentLead.notes || []).filter(n => n.text?.includes('📞 Call Note:')).length})
                      </h4>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto">
                        {(() => {
                          const callNotes = (currentLead.notes || []).filter(n => n.text?.includes('📞 Call Note:'));
                          if (callNotes.length > 0) {
                            return callNotes.slice().reverse().map((note, idx) => (
                              <div key={idx} className="p-3 bg-[#F5F2EC] rounded-lg text-sm border-l-4 border-green-500">
                                <p className="text-[#1A1A1A]">{note.text.replace('📞 Call Note: ', '')}</p>
                                <p className="text-[10px] text-[#6B6B6B] mt-1">{format(new Date(note.timestamp), 'MMM d, yyyy HH:mm')}</p>
                              </div>
                            ));
                          }
                          return <p className="text-sm text-[#6B6B6B] text-center py-4">No call history yet</p>;
                        })()}
                      </div>
                    </div>

                    {/* Add New Call Note */}
                    <div className="border-t border-[#E5DFD5] pt-4">
                      <h4 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">Log Call Note</h4>
                      <Textarea
                        placeholder="What was discussed? Any follow-up needed?..."
                        value={callNote}
                        onChange={(e) => setCallNote(e.target.value)}
                        className="border-[#E5DFD5] min-h-[80px] mb-3"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowCallNoteModal(false);
                            setCallNote("");
                          }}
                          className="border-[#E5DFD5]"
                        >
                          Close
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!callNote.trim()) return;
                            setIsSaving(true);
                            try {
                              const currentNotes = editedLead.notes || lead.notes || [];
                              const newCallNote = {
                                user_id: "current_user",
                                text: `📞 Call Note: ${callNote}`,
                                timestamp: new Date().toISOString()
                              };
                              const updatedNotes = [...currentNotes, newCallNote];
                              await Lead.update(lead.id, { notes: updatedNotes });
                              setEditedLead(prev => ({ ...prev, notes: updatedNotes }));
                              setCallNote("");
                              onLeadUpdate();
                            } catch (error) {
                              console.error('Error saving call note:', error);
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          disabled={!callNote.trim() || isSaving}
                          className="bg-[#1A1A1A] hover:bg-[#333] text-white"
                        >
                          {isSaving ? 'Saving...' : 'Save Note'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTES & FILES TAB */}
            <TabsContent value="notes" className="p-5 space-y-5 m-0">
              {/* Add Note */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm">
                <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Add Note</h3>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 border-[#E5DFD5] min-h-[60px]"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    className="bg-[#1A1A1A] hover:bg-[#333]"
                  >
                    {isAddingNote ? '...' : 'Add'}
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm">
                <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">
                  Notes ({lead.notes?.length || 0})
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {lead.notes?.length > 0 ? (
                    lead.notes.slice().reverse().map((note, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-[#F5F2EC] to-[#F9F7F4] rounded-lg border border-[#E5DFD5]/30">
                        <p className="text-sm text-[#1A1A1A]">{note.text}</p>
                        <p className="text-[10px] text-[#6B6B6B] mt-2">
                          {format(new Date(note.timestamp), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#6B6B6B] text-center py-6">No notes yet</p>
                  )}
                </div>
              </div>

              {/* Files */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm">
                <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">
                  Files ({lead.files?.length || 0})
                </h3>
                {lead.files?.length > 0 ? (
                  <div className="space-y-2">
                    {lead.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#F5F2EC]/60 rounded-lg hover:bg-[#F5F2EC] transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#6B6B6B]" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">View</a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B6B6B] text-center py-6">No files uploaded</p>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm">
                <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-[#6B6B6B]">Created: {format(new Date(lead.created_date), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-[#6B6B6B]">Updated: {format(new Date(lead.updated_date || lead.created_date), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}