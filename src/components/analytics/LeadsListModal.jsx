import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead } from "@/api/entities";
import { format } from "date-fns";
import { 
  Search, 
  Phone, 
  Mail, 
  Plane, 
  DollarSign,
  Calendar,
  User,
  ArrowRight,
  X
} from "lucide-react";

const statusColors = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-purple-100 text-purple-700",
  quoted: "bg-indigo-100 text-indigo-700",
  pending_client: "bg-orange-100 text-orange-700",
  booked: "bg-green-100 text-green-700",
  flown: "bg-emerald-100 text-emerald-700",
  lost: "bg-gray-100 text-gray-700"
};

const priorityColors = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-yellow-100 text-yellow-700",
  cold: "bg-blue-100 text-blue-700"
};

export default function LeadsListModal({ 
  isOpen, 
  onClose, 
  leads, 
  title, 
  subtitle,
  users = [],
  showAssign = false,
  onLeadUpdate
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningLead, setAssigningLead] = useState(null);

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lead.client?.full_name?.toLowerCase().includes(search) ||
      lead.client?.email?.toLowerCase().includes(search) ||
      lead.trip?.legs?.[0]?.from_iata?.toLowerCase().includes(search) ||
      lead.trip?.legs?.[0]?.to_iata?.toLowerCase().includes(search)
    );
  });

  const handleAssign = async (leadId, userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    try {
      await Lead.update(leadId, {
        owner_user_id: userId,
        owner_email: user.email,
        owner_name: user.full_name
      });
      setAssigningLead(null);
      if (onLeadUpdate) onLeadUpdate();
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };

  const totalRevenue = leads.reduce((sum, l) => sum + (l.client_closing_price || 0), 0);
  const totalProfit = leads.reduce((sum, l) => sum + ((l.client_closing_price || 0) - (l.operator_closing_price || 0)), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-white rounded-2xl p-0">
        <DialogHeader className="p-6 pb-4 border-b border-[#E5DFD5] bg-gradient-to-r from-[#F9F7F4] to-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-[#1A1A1A]">{title}</DialogTitle>
              {subtitle && <p className="text-sm text-[#6B6B6B] mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <p className="text-[#6B6B6B]">Total Value</p>
                <p className="font-bold text-[#1A1A1A]">${totalRevenue.toLocaleString()}</p>
              </div>
              {totalProfit > 0 && (
                <div className="text-right">
                  <p className="text-[#6B6B6B]">Profit</p>
                  <p className="font-bold text-green-600">${totalProfit.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <Input
              placeholder="Search by name, email, or route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#E5DFD5] rounded-xl"
            />
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-4">
          <div className="space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-[#6B6B6B]">
                <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No leads found</p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const leg = lead.trip?.legs?.[0];
                return (
                  <div 
                    key={lead.id}
                    className="p-4 bg-[#F9F7F4] rounded-xl hover:bg-[#F5F2EC] transition-colors border border-transparent hover:border-[#E5DFD5]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-[#1A1A1A] truncate">
                            {lead.client?.full_name || 'Unknown Client'}
                          </h4>
                          <Badge className={`${statusColors[lead.status]} text-xs`}>
                            {lead.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${priorityColors[lead.priority]} text-xs`}>
                            {lead.priority}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B6B6B]">
                          {leg && (
                            <div className="flex items-center gap-1">
                              <Plane className="w-3 h-3" />
                              <span className="font-mono">{leg.from_iata}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span className="font-mono">{leg.to_iata}</span>
                            </div>
                          )}
                          {leg?.depart_iso && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(leg.depart_iso), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                          {lead.trip?.pax && (
                            <span>{lead.trip.pax} pax</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {lead.client?.email && (
                            <a href={`mailto:${lead.client.email}`} className="flex items-center gap-1 text-[#6B6B6B] hover:text-[#1A1A1A]">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{lead.client.email}</span>
                            </a>
                          )}
                          {lead.client?.phone_e164 && (
                            <a href={`tel:${lead.client.phone_e164}`} className="flex items-center gap-1 text-[#6B6B6B] hover:text-[#1A1A1A]">
                              <Phone className="w-3 h-3" />
                              <span>{lead.client.phone_e164}</span>
                            </a>
                          )}
                        </div>

                        {lead.owner_name && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-[#6B6B6B]">
                            <User className="w-3 h-3" />
                            <span>Assigned to: {lead.owner_name}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        {lead.client_closing_price ? (
                          <div>
                            <p className="font-bold text-[#1A1A1A]">${lead.client_closing_price.toLocaleString()}</p>
                            {lead.operator_closing_price && (
                              <p className="text-xs text-green-600">
                                +${(lead.client_closing_price - lead.operator_closing_price).toLocaleString()} profit
                              </p>
                            )}
                          </div>
                        ) : lead.estimate?.price_max ? (
                          <p className="text-sm text-[#6B6B6B]">
                            Est: ${(lead.estimate.price_min/1000).toFixed(0)}k-${(lead.estimate.price_max/1000).toFixed(0)}k
                          </p>
                        ) : null}

                        {showAssign && lead.status !== 'flown' && (
                          <div className="mt-2">
                            {assigningLead === lead.id ? (
                              <Select onValueChange={(v) => handleAssign(lead.id, v)}>
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.full_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => setAssigningLead(lead.id)}
                              >
                                {lead.owner_user_id ? 'Reassign' : 'Assign'}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 border-t border-[#E5DFD5] bg-[#F9F7F4]">
          <p className="text-sm text-[#6B6B6B] text-center">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}