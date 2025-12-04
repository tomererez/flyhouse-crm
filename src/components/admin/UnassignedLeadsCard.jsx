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
  AlertTriangle,
  MapPin,
  ArrowRight,
  Calendar,
  UserPlus,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { Lead } from "@/api/entities";
import { priorityColors } from "../utils/ColorConfig";

export default function UnassignedLeadsCard({ leads, users, onLeadClick, onLeadUpdate }) {
  const [assigningLeadId, setAssigningLeadId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleAssign = async (lead) => {
    if (!selectedUserId) return;
    
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return;

    try {
      await Lead.update(lead.id, {
        owner_user_id: user.id,
        owner_email: user.email,
        owner_name: user.full_name
      });
      setAssigningLeadId(null);
      setSelectedUserId("");
      if (onLeadUpdate) onLeadUpdate();
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };

  return (
    <Card className="bg-white border-[#E5DFD5] rounded-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-[#1A1A1A]">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Unassigned Leads
          <Badge className="bg-amber-100 text-amber-800 ml-auto">{leads.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
        {leads.length === 0 ? (
          <div className="text-center py-8 text-[#6B6B6B]">
            <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>All leads are assigned!</p>
          </div>
        ) : (
          leads.slice(0, 10).map((lead) => {
            const leg = lead.trip?.legs?.[0];
            const colors = priorityColors[lead.priority] || priorityColors.warm;
            
            return (
              <div 
                key={lead.id}
                className="border border-[#E5DFD5] p-3 hover:border-[#1A1A1A] transition-all"
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => onLeadClick?.(lead)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1A1A1A]">
                      {lead.client?.full_name || 'Unknown'}
                    </span>
                    <Badge className={`${colors.badge} border text-xs`}>
                      {lead.priority}
                    </Badge>
                  </div>
                  
                  {leg && (
                    <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="font-mono">{leg.from_iata}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="font-mono">{leg.to_iata}</span>
                      {leg.depart_iso && (
                        <>
                          <span className="mx-1">•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(leg.depart_iso), 'MMM d')}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {assigningLeadId === lead.id ? (
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="flex-1 h-8 text-sm rounded-none">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      className="h-8 bg-green-600 hover:bg-green-700 rounded-none"
                      onClick={() => handleAssign(lead)}
                      disabled={!selectedUserId}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full mt-2 h-7 text-xs rounded-none border-[#1A1A1A]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssigningLeadId(lead.id);
                    }}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Assign
                  </Button>
                )}
              </div>
            );
          })
        )}
        
        {leads.length > 10 && (
          <p className="text-center text-sm text-[#6B6B6B] py-2">
            +{leads.length - 10} more unassigned leads
          </p>
        )}
      </CardContent>
    </Card>
  );
}