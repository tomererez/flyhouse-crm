import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Mail,
  ChevronRight,
  Plane,
  User,
  Star,
  Crown,
  DollarSign,
  Check
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Lead } from "@/api/entities";
import { clientTierColors } from "../utils/ColorConfig";
import ClientFlightsModal from "./ClientFlightsModal";

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

// Team member colors - used to distinguish team members visually
const teamMemberColors = [
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
  { bg: 'bg-cyan-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-white' },
];

// Generate a consistent color for a team member based on their ID/email
const getTeamMemberColor = (ownerId) => {
  if (!ownerId) return null;
  let hash = 0;
  for (let i = 0; i < ownerId.length; i++) {
    hash = ((hash << 5) - hash) + ownerId.charCodeAt(i);
    hash = hash & hash;
  }
  return teamMemberColors[Math.abs(hash) % teamMemberColors.length];
};

export default function ClientsTable({ leads, isLoading, onLeadUpdate }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showFlightsModal, setShowFlightsModal] = useState(false);

  const handleTierChange = async (client, newTier) => {
    try {
      for (const lead of client.leads) {
        await Lead.update(lead.id, {
          client: {
            ...lead.client,
            client_tier: newTier
          }
        });
      }
      if (onLeadUpdate) onLeadUpdate();
    } catch (error) {
      console.error('Error updating client tier:', error);
    }
  };

  // Group leads by client email
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
    // Track owner info from the most recent lead
    if (lead.owner_user_id && !clientsMap[email].owner_user_id) {
    clientsMap[email].owner_user_id = lead.owner_user_id;
    clientsMap[email].owner_name = lead.owner_name;
    }
    });

  const clients = Object.values(clientsMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowFlightsModal(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-[#E5DFD5] rounded-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5DFD5]">
                <TableHead>Client</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Flights</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-[#E5DFD5]">
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white border-[#E5DFD5] rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E5DFD5] hover:bg-[#F5F2EC]">
                  <TableHead className="text-[#1A1A1A] font-semibold">Client</TableHead>
                  <TableHead className="text-[#1A1A1A] font-semibold">Assigned</TableHead>
                  <TableHead className="text-[#1A1A1A] font-semibold">Tier</TableHead>
                  <TableHead className="text-[#1A1A1A] font-semibold">Flights</TableHead>
                  <TableHead className="text-[#1A1A1A] font-semibold">Total Revenue</TableHead>
                  <TableHead className="text-[#1A1A1A] font-semibold">Contact</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const TierIcon = clientTierIcons[client.tier] || User;
                  const tierColors = clientTierColors[client.tier] || clientTierColors.new;

                  return (
                    <TableRow
                      key={client.email}
                      className="border-[#E5DFD5] hover:bg-[#F5F2EC] transition-colors duration-200 cursor-pointer"
                      onClick={() => handleClientClick(client)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${tierColors.bg} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-semibold text-sm">
                              {client.name?.[0]?.toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1A1A1A] truncate">
                              {client.name || 'Unknown Client'}
                            </p>
                            <p className="text-sm text-[#6B6B6B] truncate">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {client.owner_user_id ? (
                          <div className="flex items-center gap-2" title={client.owner_name}>
                            <div className={`w-8 h-8 ${getTeamMemberColor(client.owner_user_id)?.bg} rounded-full flex items-center justify-center`}>
                              <span className="text-white font-semibold text-xs">
                                {client.owner_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="text-sm text-[#6B6B6B] hidden lg:inline truncate max-w-[80px]">
                              {client.owner_name?.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#6B6B6B]">—</span>
                        )}
                      </TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge className={`${tierColors.badge} border flex items-center gap-1 w-fit cursor-pointer hover:opacity-80`}>
                              <TierIcon className="w-3 h-3" />
                              {clientTierLabels[client.tier]}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleTierChange(client, 'new')}>
                              <User className="w-4 h-4 mr-2" />
                              Newbie
                              {client.tier === 'new' && <Check className="w-4 h-4 ml-auto" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTierChange(client, 'retainer')}>
                              <Star className="w-4 h-4 mr-2" />
                              Retainer
                              {client.tier === 'retainer' && <Check className="w-4 h-4 ml-auto" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTierChange(client, 'elite')}>
                              <Crown className="w-4 h-4 mr-2" />
                              Elite
                              {client.tier === 'elite' && <Check className="w-4 h-4 ml-auto" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-[#6B6B6B]" />
                          <span className="font-medium text-[#1A1A1A]">
                            {client.leads.length} total
                          </span>
                          {client.totalFlights > 0 && (
                            <span className="text-sm text-[#6B6B6B]">
                              ({client.totalFlights} completed)
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            ${client.totalRevenue.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (client.phone) window.open(`tel:${client.phone}`);
                            }}
                            disabled={!client.phone}
                          >
                            <Phone className="w-4 h-4 text-[#1A1A1A]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`mailto:${client.email}`);
                            }}
                          >
                            <Mail className="w-4 h-4 text-[#1A1A1A]" />
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell>
                        <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {clients.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-[#6B6B6B] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No clients found</h3>
              <p className="text-[#6B6B6B]">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ClientFlightsModal
        client={selectedClient}
        isOpen={showFlightsModal}
        onClose={() => setShowFlightsModal(false)}
        onLeadUpdate={onLeadUpdate}
      />
    </>
  );
}