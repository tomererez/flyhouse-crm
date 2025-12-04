import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Sparkles,
  MapPin,
  ArrowRight,
  Calendar,
  UserPlus,
  Phone,
  Mail,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { priorityColors } from "../utils/ColorConfig";

export default function NewLeadsCard({ leads, onClaimLead, onLeadClick }) {
  const [showAllModal, setShowAllModal] = useState(false);

  if (leads.length === 0) {
    return null;
  }

  const LeadItem = ({ lead, inModal = false }) => {
    const leg = lead.trip?.legs?.[0];
    const colors = priorityColors[lead.priority] || priorityColors.warm;
    
    return (
      <div 
        className={`bg-white border ${inModal ? 'border-[#E5DFD5]' : 'border-amber-200'} p-4 rounded-lg hover:border-amber-400 hover:shadow-sm transition-all`}
      >
        <div 
          className="cursor-pointer"
          onClick={() => onLeadClick?.(lead)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#1A1A1A]">
              {lead.client?.full_name || 'Unknown Client'}
            </span>
            <Badge className={`${colors.badge} border text-xs`}>
              {lead.priority}
            </Badge>
          </div>
          
          {leg && (
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-2">
              <MapPin className="w-3 h-3" />
              <span className="font-mono font-bold">{leg.from_iata}</span>
              <ArrowRight className="w-3 h-3" />
              <span className="font-mono font-bold">{leg.to_iata}</span>
              {leg.depart_iso && (
                <>
                  <span className="mx-1">•</span>
                  <Calendar className="w-3 h-3" />
                  <span>Dep: {format(new Date(leg.depart_iso), 'MMM d')}</span>
                </>
              )}
            </div>
          )}
          
          {lead.created_date && (
            <div className="flex items-center gap-1 text-xs text-[#6B6B6B] mb-2">
              <Clock className="w-3 h-3" />
              <span>Requested: {format(new Date(lead.created_date), 'MMM d, HH:mm')}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
            {lead.client?.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {lead.client.email}
              </span>
            )}
          </div>
        </div>

        <Button 
          size="sm" 
          className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            onClaimLead?.(lead);
          }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Claim This Lead
        </Button>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
          <Sparkles className="w-5 h-5 text-amber-500" />
          New Leads Available
          <Badge 
            className="bg-amber-500 text-white ml-auto cursor-pointer hover:bg-amber-600 transition-colors"
            onClick={() => setShowAllModal(true)}
          >
            {leads.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-amber-700">Claim these leads to add them to your pipeline</p>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {leads.slice(0, 5).map((lead) => (
          <LeadItem key={lead.id} lead={lead} />
        ))}
        
        {leads.length > 5 && (
          <button 
            onClick={() => setShowAllModal(true)}
            className="w-full text-center text-sm text-amber-700 py-2 hover:text-amber-900 hover:underline cursor-pointer"
          >
            +{leads.length - 5} more new leads available - Click to view all
          </button>
        )}
      </CardContent>

      <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-[#F5F2EC] border-[#E5DFD5] p-0">
          <DialogHeader className="p-6 pb-4 bg-amber-50 border-b border-amber-200">
            <DialogTitle className="flex items-center gap-2 text-amber-800">
              <Sparkles className="w-5 h-5 text-amber-500" />
              All New Leads ({leads.length})
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
            {leads.map((lead) => (
              <LeadItem key={lead.id} lead={lead} inModal />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}