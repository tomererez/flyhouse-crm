import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import LeadCard from "./LeadCard";

export default function KanbanColumn({ column, leads, isLoading, onLeadClick }) {
  return (
    <div className="w-80 flex-shrink-0 h-full">
      <div className="card-glass rounded-xl p-4 h-full flex flex-col max-h-full">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
          </div>
          <Badge variant="outline" className="bg-white/50">
            {leads.length}
          </Badge>
        </div>

        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 space-y-3 min-h-20 p-2 rounded-lg transition-all duration-300 overflow-y-auto ${
                snapshot.isDraggingOver 
                  ? 'bg-gradient-to-b from-blue-50 to-purple-50 border-2 border-dashed border-blue-300' 
                  : 'border-2 border-transparent'
              }`}
            >
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="card-glass rounded-lg p-4 animate-pulse">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24 mb-3" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : (
                leads.map((lead, index) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    index={index}
                    onLeadClick={onLeadClick}
                  />
                ))
              )}
              
              {!isLoading && leads.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className={`w-8 h-8 rounded-full ${column.color} opacity-30 mx-auto mb-2`} />
                  <p className="text-sm">Drop leads here</p>
                </div>
              )}
              
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}