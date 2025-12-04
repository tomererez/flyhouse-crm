import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  ArrowRight,
  Clock,
  Flame,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

import { priorityColors } from "../utils/ColorConfig";

export default function LeadCard({ lead, index, onLeadClick }) {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white border border-[#E5DFD5] p-3 rounded-xl cursor-grab active:cursor-grabbing transition-shadow duration-200 select-none ${
            snapshot.isDragging 
              ? 'shadow-xl border-2 border-blue-300 z-50' 
              : 'hover:border-[#1A1A1A] hover:shadow-md'
          }`}
          style={provided.draggableProps.style}
          onClick={(e) => {
            if (!snapshot.isDragging) {
              e.stopPropagation();
              onLeadClick?.(lead);
            }
          }}
        >
          {/* Name & Priority */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="font-semibold text-[#1A1A1A] text-sm truncate">
                {lead.client?.full_name || 'Unknown'}
              </h4>
              {lead.priority === 'hot' && (
                <Flame className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              )}
            </div>
            <Badge className={`${priorityColors[lead.priority]?.badge} border text-[10px] px-1.5 py-0 flex-shrink-0`}>
              {lead.priority}
            </Badge>
          </div>

          {/* Route */}
          {lead.trip?.legs?.[0] && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="font-mono font-bold text-[#1A1A1A]">{lead.trip.legs[0].from_iata}</span>
              <ArrowRight className="w-3 h-3 flex-shrink-0" />
              <span className="font-mono font-bold text-[#1A1A1A]">{lead.trip.legs[0].to_iata}</span>
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-col gap-1 text-[10px] text-[#6B6B6B]">
            {lead.trip?.legs?.[0]?.depart_iso && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-500" />
                <span>Dep: {format(new Date(lead.trip.legs[0].depart_iso), 'MMM d, HH:mm')}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Req: {format(new Date(lead.created_date), 'MMM d, HH:mm')}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}