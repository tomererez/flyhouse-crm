import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Star, 
  Crown, 
  Mail, 
  Phone, 
  Globe,
  Plane,
  Calendar,
  MapPin,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronRight,
  X,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { clientTierColors, statusColors, priorityColors } from "../utils/ColorConfig";
import { Lead } from "@/api/entities";

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

export default function ClientProfileCard({ clientEmail, onLeadClick, isOpen, onClose }) {
  const [clientLeads, setClientLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (clientEmail && isOpen) {
      loadClientLeads();
    }
  }, [clientEmail, isOpen]);

  const loadClientLeads = async () => {
    setIsLoading(true);
    try {
      const allLeads = await Lead.list('-created_date');
      const filtered = allLeads.filter(
        lead => lead.client?.email?.toLowerCase() === clientEmail?.toLowerCase()
      );
      setClientLeads(filtered);
    } catch (error) {
      console.error('Error loading client leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierChange = async (newTier) => {
    try {
      for (const lead of clientLeads) {
        await Lead.update(lead.id, {
          client: {
            ...lead.client,
            client_tier: newTier
          }
        });
      }
      loadClientLeads();
    } catch (error) {
      console.error('Error updating client tier:', error);
    }
  };

  if (!clientEmail || clientLeads.length === 0) return null;

  const clientInfo = clientLeads[0]?.client;
  const TierIcon = clientTierIcons[clientInfo?.client_tier] || User;
  const tierColors = clientTierColors[clientInfo?.client_tier] || clientTierColors.new;

  // Calculate stats
  const completedFlights = clientLeads.filter(l => l.status === 'flown' || l.status === 'booked');
  const totalRevenue = completedFlights.reduce((sum, l) => sum + (l.client_closing_price || 0), 0);
  const totalProfit = completedFlights.reduce((sum, l) => 
    sum + ((l.client_closing_price || 0) - (l.operator_closing_price || 0)), 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-[#F5F2EC] border-[#E5DFD5] p-0 rounded-2xl [&>button]:top-3 [&>button]:right-3 [&>button]:text-gray-600 [&>button]:bg-white/60 [&>button]:rounded-full [&>button]:w-8 [&>button]:h-8 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:hover:bg-white/80 [&>button]:transition-all [&>button]:z-50">
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header with Client Info */}
          <div className="bg-[#1A1A1A] text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${tierColors.bg} flex items-center justify-center`}>
                  <TierIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{clientInfo?.full_name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button className={`${tierColors.badge} border cursor-pointer hover:opacity-80 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none`}>
                          <TierIcon className="w-3 h-3 mr-1" />
                          {clientTierLabels[clientInfo?.client_tier] || 'Newbie'}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="z-[100]">
                        <DropdownMenuItem onClick={() => handleTierChange('new')}>
                          <User className="w-4 h-4 mr-2" />
                          Newbie
                          {(clientInfo?.client_tier === 'new' || !clientInfo?.client_tier) && <Check className="w-4 h-4 ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTierChange('retainer')}>
                          <Star className="w-4 h-4 mr-2" />
                          Retainer
                          {clientInfo?.client_tier === 'retainer' && <Check className="w-4 h-4 ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTierChange('elite')}>
                          <Crown className="w-4 h-4 mr-2" />
                          Elite
                          {clientInfo?.client_tier === 'elite' && <Check className="w-4 h-4 ml-auto" />}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <span className="text-gray-300 text-sm">{clientLeads.length} flights</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{clientInfo?.email}</span>
              </div>
              {clientInfo?.phone_e164 && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{clientInfo.phone_e164}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 p-6 bg-white border-b border-[#E5DFD5]">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1A1A1A]">{clientLeads.length}</p>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Total Flights</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1A1A1A]">{completedFlights.length}</p>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">${totalProfit.toLocaleString()}</p>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Total Profit</p>
            </div>
          </div>

          {/* Flights List */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Flight History</h3>
            
            <div className="space-y-3">
              {clientLeads.map((lead) => {
                const leg = lead.trip?.legs?.[0];
                const profit = (lead.client_closing_price || 0) - (lead.operator_closing_price || 0);
                
                return (
                  <div 
                    key={lead.id}
                    className="bg-white border border-[#E5DFD5] p-4 hover:border-[#1A1A1A] transition-all cursor-pointer group"
                    onClick={() => {
                      onClose();
                      setTimeout(() => onLeadClick?.(lead), 200);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Route */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#6B6B6B]" />
                            <span className="font-mono font-bold text-lg text-[#1A1A1A]">
                              {leg?.from_iata || '???'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#6B6B6B]" />
                            <span className="font-mono font-bold text-lg text-[#1A1A1A]">
                              {leg?.to_iata || '???'}
                            </span>
                          </div>
                          {lead.trip?.type === 'round_trip' && (
                            <Badge variant="outline" className="text-xs">Round Trip</Badge>
                          )}
                        </div>

                        {/* Date & Status */}
                        <div className="flex items-center gap-4 text-sm">
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
                      <div className="text-right ml-4">
                        {lead.client_closing_price ? (
                          <>
                            <p className="font-semibold text-[#1A1A1A]">
                              ${lead.client_closing_price.toLocaleString()}
                            </p>
                            {profit > 0 && (
                              <p className="text-sm text-green-600">
                                +${profit.toLocaleString()} profit
                              </p>
                            )}
                          </>
                        ) : lead.estimate?.price_max ? (
                          <p className="text-sm text-[#6B6B6B]">
                            Est. ${lead.estimate.price_min?.toLocaleString()} - ${lead.estimate.price_max?.toLocaleString()}
                          </p>
                        ) : null}
                      </div>

                      <ChevronRight className="w-5 h-5 text-[#6B6B6B] ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 bg-white border-t border-[#E5DFD5]">
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-[#1A1A1A] hover:bg-[#333] text-white"
                onClick={() => window.open(`tel:${clientInfo?.phone_e164}`)}
                disabled={!clientInfo?.phone_e164}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Client
              </Button>
              <Button 
                variant="outline"
                className="flex-1 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white"
                onClick={() => window.open(`mailto:${clientInfo?.email}`)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}