import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  Phone, 
  Mail, 
  MapPin,
  ArrowRight,
  Users as UsersIcon
} from "lucide-react";
import { format } from "date-fns";

export default function PriorityLeads({ leads, onLeadClick }) {
  return (
    <Card className="bg-white border-[#E5DFD5] rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#1A1A1A]" />
            Priority Leads
          </div>
          <Badge className="bg-[#1A1A1A] text-white border-none rounded-lg">
            {leads.length} hot
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {leads.slice(0, 5).map((lead) => (
          <div 
            key={lead.id} 
            className="p-4 bg-[#F5F2EC] border border-[#E5DFD5] rounded-lg cursor-pointer hover:border-[#1A1A1A] hover:shadow-sm transition-all duration-200"
            onClick={() => onLeadClick?.(lead)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-[#1A1A1A]">
                  {lead.client?.full_name || 'Unknown Client'}
                </h4>
                <p className="text-sm text-[#6B6B6B]">{lead.client?.email}</p>
              </div>
              <Badge className="bg-[#1A1A1A] text-white border-none rounded-none text-xs">
                {lead.priority.toUpperCase()}
              </Badge>
            </div>
            
            {lead.trip?.legs?.[0] && (
              <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-2">
                <MapPin className="w-3 h-3" />
                <span>{lead.trip.legs[0].from_iata}</span>
                <ArrowRight className="w-3 h-3" />
                <span>{lead.trip.legs[0].to_iata}</span>
                {lead.trip.pax && (
                  <>
                    <span className="text-[#E5DFD5]">•</span>
                    <UsersIcon className="w-3 h-3" />
                    <span>{lead.trip.pax} pax</span>
                  </>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B6B6B]">
                {format(new Date(lead.created_date), 'MMM d, HH:mm')}
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 px-3 bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lead.client?.phone_e164) {
                      window.open(`tel:${lead.client.phone_e164}`);
                    }
                  }}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 px-3 bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lead.client?.email) {
                      window.open(`mailto:${lead.client.email}`);
                    }
                  }}
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {leads.length === 0 && (
          <div className="text-center py-6 text-[#6B6B6B]">
            <Flame className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hot leads</p>
            <p className="text-xs">Priority prospects will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}