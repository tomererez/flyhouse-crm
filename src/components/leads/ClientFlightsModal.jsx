import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  User, 
  Star, 
  Crown, 
  Mail, 
  Phone,
  Plane,
  Calendar,
  MapPin,
  ArrowRight,
  DollarSign,
  ChevronRight,
  Edit2,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Lead } from "@/api/entities";
import { clientTierColors, statusColors, priorityColors } from "../utils/ColorConfig";

const clientTierIcons = {
  new: User,
  retainer: Star,
  elite: Crown
};

const clientTierLabels = {
  new: "Newbie",
  retainer: "Retainer",
  elite: "Elite"
};

export default function ClientFlightsModal({ client, isOpen, onClose, onLeadUpdate }) {
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [selectedTier, setSelectedTier] = useState(client?.tier || 'new');
  const [isSaving, setIsSaving] = useState(false);

  if (!client) return null;

  const currentTier = client.tier || 'new';
  const TierIcon = clientTierIcons[currentTier] || User;
  const tierColors = clientTierColors[currentTier] || clientTierColors.new;

  const handleTierChange = async () => {
    if (selectedTier === currentTier) {
      setIsEditingTier(false);
      return;
    }
    
    setIsSaving(true);
    try {
      // Update all leads for this client
      for (const lead of client.leads) {
        await Lead.update(lead.id, {
          client: {
            ...lead.client,
            client_tier: selectedTier
          }
        });
      }
      
      // Update local client object
      client.tier = selectedTier;
      setIsEditingTier(false);
      if (onLeadUpdate) onLeadUpdate();
    } catch (error) {
      console.error('Error updating client tier:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Sort leads by date
  const sortedLeads = [...client.leads].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  // Calculate profit
  const totalProfit = sortedLeads.reduce((sum, lead) => {
    if (lead.status === 'flown' || lead.status === 'booked') {
      return sum + ((lead.client_closing_price || 0) - (lead.operator_closing_price || 0));
    }
    return sum;
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-[#F5F2EC] border-[#E5DFD5] p-0 rounded-2xl [&>button]:top-3 [&>button]:right-3 [&>button]:text-gray-600 [&>button]:bg-white/60 [&>button]:rounded-full [&>button]:w-8 [&>button]:h-8 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:hover:bg-white/80 [&>button]:transition-all [&>button]:z-50">
        <div className="overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="bg-[#1A1A1A] text-white p-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${tierColors.bg} flex items-center justify-center`}>
                <TierIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{client.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  {isEditingTier ? (
                    <div className="flex items-center gap-2">
                      <Select value={selectedTier} onValueChange={setSelectedTier}>
                        <SelectTrigger className="w-32 h-8 bg-white/10 border-white/20 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Newbie</SelectItem>
                          <SelectItem value="retainer">Retainer</SelectItem>
                          <SelectItem value="elite">Elite</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                        onClick={handleTierChange}
                        disabled={isSaving}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge className={`${tierColors.badge} border`}>
                        <TierIcon className="w-3 h-3 mr-1" />
                        {clientTierLabels[currentTier]}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-white/10"
                        onClick={() => {
                          setSelectedTier(currentTier);
                          setIsEditingTier(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3 text-gray-300" />
                      </Button>
                    </div>
                  )}
                  <span className="text-gray-300 text-sm">{client.email}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => client.phone && window.open(`tel:${client.phone}`)}
                  disabled={!client.phone}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => window.open(`mailto:${client.email}`)}
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-white border-b border-[#E5DFD5]">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1A1A1A]">{client.leads.length}</p>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Total Flights</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${client.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">${totalProfit.toLocaleString()}</p>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Profit</p>
            </div>
          </div>

          {/* Flights List */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">
              All Flights ({sortedLeads.length})
            </h3>
            
            <div className="space-y-2">
              {sortedLeads.map((lead) => {
                const leg = lead.trip?.legs?.[0];
                const profit = (lead.client_closing_price || 0) - (lead.operator_closing_price || 0);
                
                return (
                  <Link 
                    key={lead.id}
                    to={`${createPageUrl("TripDetail")}?id=${lead.id}`}
                    onClick={onClose}
                    className="block"
                  >
                    <div className="bg-white border border-[#E5DFD5] p-4 hover:border-[#1A1A1A] transition-all cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Route */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#6B6B6B]" />
                              <span className="font-mono font-bold text-[#1A1A1A]">
                                {leg?.from_iata || '???'}
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#6B6B6B]" />
                              <span className="font-mono font-bold text-[#1A1A1A]">
                                {leg?.to_iata || '???'}
                              </span>
                            </div>
                            {lead.trip?.type === 'round_trip' && (
                              <Badge variant="outline" className="text-xs">Round Trip</Badge>
                            )}
                          </div>

                          {/* Date & Status */}
                          <div className="flex items-center gap-3 text-sm">
                            {leg?.depart_iso && (
                              <div className="flex items-center gap-1 text-[#6B6B6B]">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(leg.depart_iso), 'MMM d, yyyy')}</span>
                              </div>
                            )}
                            <Badge className={`${statusColors[lead.status]?.badge} border text-xs`}>
                              {lead.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={`${priorityColors[lead.priority]?.badge} border text-xs`}>
                              {lead.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Financials */}
                        <div className="text-right ml-4 flex items-center gap-3">
                          {lead.client_closing_price ? (
                            <div>
                              <p className="font-semibold text-[#1A1A1A]">
                                ${lead.client_closing_price.toLocaleString()}
                              </p>
                              {profit > 0 && (
                                <p className="text-xs text-green-600">
                                  +${profit.toLocaleString()}
                                </p>
                              )}
                            </div>
                          ) : lead.estimate?.price_max ? (
                            <p className="text-sm text-[#6B6B6B]">
                              ~${lead.estimate.price_max?.toLocaleString()}
                            </p>
                          ) : null}
                          <ChevronRight className="w-5 h-5 text-[#6B6B6B] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}