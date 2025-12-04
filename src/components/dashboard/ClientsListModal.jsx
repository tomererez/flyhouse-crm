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
  User, 
  Star, 
  Crown, 
  Mail, 
  Phone,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { clientTierColors, priorityColors } from "../utils/ColorConfig";
import ClientFlightsModal from "../leads/ClientFlightsModal";

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

export default function ClientsListModal({ 
  isOpen, 
  onClose, 
  title, 
  leads,
  filterType,
  filterValue 
}) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientFlights, setShowClientFlights] = useState(false);

  if (!leads) return null;

  // Group leads by client email to get unique clients
  const clientsMap = {};
  leads.forEach(lead => {
    const email = lead.client?.email?.toLowerCase();
    if (!email) return;
    
    if (!clientsMap[email]) {
      clientsMap[email] = {
        email,
        name: lead.client?.full_name,
        phone: lead.client?.phone_e164,
        tier: lead.client?.client_tier || 'new',
        leads: [],
        totalRevenue: 0,
        totalFlights: 0
      };
    }
    
    clientsMap[email].leads.push(lead);
    if (lead.status === 'flown' || lead.status === 'booked') {
      clientsMap[email].totalRevenue += (lead.client_closing_price || 0);
      clientsMap[email].totalFlights += 1;
    }
  });

  const clients = Object.values(clientsMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowClientFlights(true);
  };

  const handleClientFlightsClose = () => {
    setShowClientFlights(false);
    setSelectedClient(null);
  };

  return (
    <>
      <Dialog open={isOpen && !showClientFlights} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-[#F5F2EC] border-[#E5DFD5] p-0 rounded-2xl [&>button]:top-3 [&>button]:right-3 [&>button]:text-gray-600 [&>button]:bg-white/60 [&>button]:rounded-full [&>button]:w-8 [&>button]:h-8 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:hover:bg-white/80 [&>button]:transition-all [&>button]:z-50">
          <div className="overflow-y-auto max-h-[80vh]">
            {/* Header */}
            <div className="bg-[#1A1A1A] text-white p-6">
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
              <p className="text-gray-300 text-sm mt-1">
                {clients.length} client{clients.length !== 1 ? 's' : ''} • {leads.length} total flight{leads.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Clients List */}
            <div className="p-4 space-y-2">
              {clients.map((client) => {
                const TierIcon = clientTierIcons[client.tier] || User;
                const tierColors = clientTierColors[client.tier] || clientTierColors.new;

                return (
                  <div
                    key={client.email}
                    onClick={() => handleClientClick(client)}
                    className="bg-white border border-[#E5DFD5] p-4 hover:border-[#1A1A1A] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${tierColors.bg} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-semibold text-sm">
                            {client.name?.[0]?.toUpperCase() || 'C'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">{client.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${tierColors.badge} border text-xs flex items-center gap-1`}>
                              <TierIcon className="w-3 h-3" />
                              {clientTierLabels[client.tier]}
                            </Badge>
                            <span className="text-xs text-[#6B6B6B]">
                              {client.leads.length} flight{client.leads.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {client.totalRevenue > 0 && (
                          <div className="text-right">
                            <p className="font-semibold text-green-600 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {client.totalRevenue.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-[#6B6B6B] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {clients.length === 0 && (
                <div className="text-center py-8 text-[#6B6B6B]">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No clients found</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Flights Modal */}
      <ClientFlightsModal
        client={selectedClient}
        isOpen={showClientFlights}
        onClose={handleClientFlightsClose}
      />
    </>
  );
}