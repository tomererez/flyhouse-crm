import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Thermometer, 
  Snowflake,
  User,
  Star,
  Crown
} from "lucide-react";
import { priorityColors, clientTierColors } from "../utils/ColorConfig";
import ClientsListModal from "./ClientsListModal";

const priorityIcons = {
  hot: Flame,
  warm: Thermometer,
  cold: Snowflake
};

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

export default function LeadCategoriesCard({ leads }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', leads: [] });

  // Count by priority
  const priorityCounts = {
    hot: leads.filter(l => l.priority === 'hot').length,
    warm: leads.filter(l => l.priority === 'warm').length,
    cold: leads.filter(l => l.priority === 'cold').length
  };

  // Count unique clients by tier
  const getUniqueClientsByTier = (tier) => {
    const uniqueEmails = new Set();
    leads.forEach(l => {
      const clientTier = l.client?.client_tier || 'new';
      if (clientTier === tier && l.client?.email) {
        uniqueEmails.add(l.client.email.toLowerCase());
      }
    });
    return uniqueEmails.size;
  };

  const clientTierCounts = {
    new: getUniqueClientsByTier('new'),
    retainer: getUniqueClientsByTier('retainer'),
    elite: getUniqueClientsByTier('elite')
  };

  const handlePriorityClick = (priority) => {
    const filteredLeads = leads.filter(l => l.priority === priority);
    setModalConfig({
      isOpen: true,
      title: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Leads`,
      leads: filteredLeads
    });
  };

  const handleTierClick = (tier) => {
    const filteredLeads = leads.filter(l => 
      tier === 'new' 
        ? (!l.client?.client_tier || l.client?.client_tier === 'new')
        : l.client?.client_tier === tier
    );
    setModalConfig({
      isOpen: true,
      title: `${clientTierLabels[tier]} Clients`,
      leads: filteredLeads
    });
  };

  return (
    <>
    <ClientsListModal
      isOpen={modalConfig.isOpen}
      onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      title={modalConfig.title}
      leads={modalConfig.leads}
    />
    <Card className="bg-white border-[#E5DFD5] rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#1A1A1A]">Lead Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Priority Section */}
        <div>
          <p className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">By Priority</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(priorityCounts).map(([priority, count]) => {
              const Icon = priorityIcons[priority];
              const colors = priorityColors[priority];
              return (
                <div 
                  key={priority}
                  onClick={() => handlePriorityClick(priority)}
                  className={`flex flex-col items-center p-3 rounded-lg ${colors.bgLight} ${colors.border} border hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-[#1A1A1A]">{count}</span>
                  <span className={`text-xs font-medium capitalize ${colors.text}`}>{priority}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Tier Section */}
        <div>
          <p className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">By Client Type</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(clientTierCounts).map(([tier, count]) => {
              const Icon = clientTierIcons[tier];
              const colors = clientTierColors[tier];
              return (
                <div 
                  key={tier}
                  onClick={() => handleTierClick(tier)}
                  className={`flex flex-col items-center p-3 rounded-lg ${colors.bgLight} ${colors.border} border hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-[#1A1A1A]">{count}</span>
                  <span className={`text-xs font-medium capitalize ${colors.text}`}>{clientTierLabels[tier]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}