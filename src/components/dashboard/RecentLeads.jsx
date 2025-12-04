import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Users as UsersIcon, 
  Clock, 
  Phone,
  Plane,
  ArrowRight,
  Calendar,
  Crown,
  Star,
  User
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { statusColors, priorityColors, clientTierColors } from "../utils/ColorConfig";
import ClientProfileCard from "./ClientProfileCard";

const clientTierIcons = {
  new: User,
  retainer: Star,
  elite: Crown
};

export default function RecentLeads({ leads, isLoading, onLeadClick }) {
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [showClientProfile, setShowClientProfile] = useState(false);

  const handleClientClick = (e, email) => {
    e.stopPropagation();
    setSelectedClientEmail(email);
    setShowClientProfile(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-[#E5DFD5] rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
            <Plane className="w-5 h-5 text-[#1A1A1A]" />
            Recent Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#F5F2EC] border border-[#E5DFD5] rounded-lg">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white border-[#E5DFD5] rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#1A1A1A]" />
              Recent Leads
            </div>
            <Badge variant="outline" className="bg-[#F5F2EC] border-[#E5DFD5] text-[#1A1A1A] rounded-lg">
              {leads.length} active
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
        {leads.map((lead) => (
          <div 
            key={lead.id} 
            className="group p-4 bg-[#F5F2EC] border border-[#E5DFD5] rounded-lg hover:border-[#1A1A1A] hover:shadow-sm transition-all duration-200 cursor-pointer"
            onClick={() => onLeadClick?.(lead)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {lead.client?.full_name?.[0]?.toUpperCase() || 'L'}
                  </span>
                </div>
                
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 
                        className="font-medium text-[#1A1A1A] hover:underline cursor-pointer"
                        onClick={(e) => handleClientClick(e, lead.client?.email)}
                      >
                        {lead.client?.full_name || 'Unknown Client'}
                      </h4>
                      <Badge className={`${priorityColors[lead.priority]?.badge} border text-xs`}>
                        {lead.priority}
                      </Badge>
                    </div>
                  
                  <div className="flex items-center gap-4 text-sm text-[#6B6B6B]">
                    {lead.trip?.legs?.[0] && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{lead.trip.legs[0].from_iata}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{lead.trip.legs[0].to_iata}</span>
                        {lead.trip.type === 'round_trip' && (
                          <Badge variant="outline" className="text-xs bg-[#F5F2EC] text-[#1A1A1A] border-[#E5DFD5] rounded ml-1">
                            Round Trip
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {lead.trip?.pax && (
                      <div className="flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        <span>{lead.trip.pax} pax</span>
                      </div>
                    )}
                  </div>

                  {/* Departure Date */}
                  {lead.trip?.legs?.[0]?.depart_iso && (
                    <div className="flex items-center gap-1 text-sm text-[#1A1A1A]">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">
                        Departs: {format(new Date(lead.trip.legs[0].depart_iso), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                  
                  {/* Creation Date */}
                  <div className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                    <Clock className="w-3 h-3" />
                    <span>Created: {format(new Date(lead.created_date), 'MMM d, HH:mm')}</span>
                  </div>
                  
                  {lead.estimate?.price_max && (
                    <div className="text-sm font-medium text-[#1A1A1A]">
                      ${lead.estimate.price_min?.toLocaleString()} - ${lead.estimate.price_max?.toLocaleString()} {lead.estimate.currency}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                {lead.client?.client_tier && (
                  <Badge className={`${clientTierColors[lead.client.client_tier]?.badge} border text-xs flex items-center gap-1`}>
                    {React.createElement(clientTierIcons[lead.client.client_tier] || User, { className: "w-3 h-3" })}
                    {lead.client.client_tier === 'new' ? 'Newbie' : lead.client.client_tier}
                  </Badge>
                )}
                <Badge className={`${statusColors[lead.status]?.badge} border text-xs`}>
                  {lead.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        
        {leads.length === 0 && (
          <div className="text-center py-8 text-[#6B6B6B]">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No leads yet</p>
            <p className="text-sm">New flight requests will appear here</p>
          </div>
        )}
        </CardContent>
        </Card>

        <ClientProfileCard
        clientEmail={selectedClientEmail}
        isOpen={showClientProfile}
        onClose={() => setShowClientProfile(false)}
        onLeadClick={onLeadClick}
        />
        </>
        );
        }