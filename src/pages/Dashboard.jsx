import React, { useState, useEffect } from "react";
import { Lead, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Plane,
  Phone,
  Mail,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Activity,
  Trash2,
  Shield,
  UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import StatsCard from "../components/dashboard/StatsCard";
import RecentLeads from "../components/dashboard/RecentLeads";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PriorityLeads from "../components/dashboard/PriorityLeads";
import LeadDetailModal from "../components/kanban/LeadDetailModal";
import InfoSlideOut from "../components/dashboard/InfoSlideOut";
import LeadCategoriesCard from "../components/dashboard/LeadCategoriesCard";
import NewLeadsCard from "../components/dashboard/NewLeadsCard";
import { ClientTierEngine } from "../components/utils/ClientTierEngine";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [slideOut, setSlideOut] = useState({ isOpen: false, title: '', data: [] });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingTiers, setIsUpdatingTiers] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const [data, me] = await Promise.all([
        Lead.list('-created_date', 100),
        User.currentUser()
      ]);
      setCurrentUser(me);
      setAllLeads(data);

      // Filter leads: show only MY leads (assigned to me)
      const myLeads = data.filter(l => l.owner_user_id === me.id);
      setLeads(myLeads);

      // Auto-update client tiers on load
      if (data.length > 0) {
        ClientTierEngine.recalculateAllTiers().catch(console.error);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unassigned leads (new leads visible to everyone)
  const unassignedLeads = allLeads.filter(l => !l.owner_user_id);

  const handleClaimLead = async (lead) => {
    if (!currentUser) return;
    try {
      await Lead.update(lead.id, {
        owner_user_id: currentUser.id,
        owner_email: currentUser.email,
        owner_name: currentUser.full_name
      });
      loadLeads();
    } catch (error) {
      console.error('Error claiming lead:', error);
    }
  };

  const handleUpdateTiers = async () => {
    setIsUpdatingTiers(true);
    try {
      const updates = await ClientTierEngine.recalculateAllTiers();
      if (updates.length > 0) {
        await loadLeads();
      }
    } catch (error) {
      console.error('Error updating tiers:', error);
    } finally {
      setIsUpdatingTiers(false);
    }
  };

  const handleDeleteAllLeads = async () => {
    if (!window.confirm("⚠️ PERMANENT DELETION WARNING ⚠️\n\nThis will permanently delete ALL leads in your database.\n\nThis action cannot be undone.\n\nType 'DELETE' in the next prompt to confirm.")) {
      return;
    }

    const confirmation = window.prompt("Type 'DELETE' (all caps) to confirm permanent deletion of all leads:");
    if (confirmation !== 'DELETE') {
      alert("Deletion cancelled - confirmation text did not match.");
      return;
    }

    setIsDeleting(true);
    try {
      const allLeads = await Lead.list();
      if (allLeads.length === 0) {
        alert("No leads to delete - database is already empty.");
        setIsDeleting(false);
        return;
      }

      // Delete in smaller batches for better reliability
      const chunkSize = 10;
      let deletedCount = 0;

      for (let i = 0; i < allLeads.length; i += chunkSize) {
        const chunk = allLeads.slice(i, i + chunkSize);
        const deletePromises = chunk.map(lead => Lead.delete(lead.id));
        await Promise.all(deletePromises);
        deletedCount += chunk.length;

        // Update progress
        console.log(`Deleted ${deletedCount}/${allLeads.length} leads...`);
      }

      // Reload to confirm deletion
      await loadLeads();
      alert(`✅ Successfully deleted ${deletedCount} leads.\n\nYour database is now empty and ready for automation.`);

    } catch (error) {
      console.error('Error deleting leads:', error);
      alert("❌ Error occurred during deletion. Please try again or contact support.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const handleStatCardClick = (title, data) => {
    setSlideOut({ isOpen: true, title, data });
  };

  const handleSlideOutLeadClick = (lead) => {
    setSlideOut({ ...slideOut, isOpen: false });
    setTimeout(() => {
      handleLeadClick(lead);
    }, 300);
  };

  const getStats = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalLeads = leads;
    const newLeads = leads.filter(lead => lead.status === 'new');
    const hotLeads = leads.filter(lead => lead.priority === 'hot');

    const monthlyBookedLeads = leads.filter(lead =>
      (lead.status === 'booked' || lead.status === 'flown') &&
      new Date(lead.updated_date) >= startOfMonth &&
      lead.client_closing_price && lead.operator_closing_price
    );

    const monthlyRevenue = monthlyBookedLeads.reduce((sum, lead) => sum + (lead.client_closing_price || 0), 0);
    const totalOperatorCost = monthlyBookedLeads.reduce((sum, lead) => sum + (lead.operator_closing_price || 0), 0);
    const monthlyProfit = monthlyRevenue - totalOperatorCost;

    return { totalLeads, newLeads, hotLeads, monthlyBookedLeads, monthlyRevenue, monthlyProfit };
  };

  // const stats = getStats(); // Moved calculations to be dynamic within JSX

  return (
    <div className="p-6 space-y-8">
      {/* Empty state when no leads assigned */}
      {leads.length === 0 && !isLoading && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-blue-800">No Leads Assigned Yet</h3>
            <p className="text-blue-700">
              {unassignedLeads.length > 0
                ? `There are ${unassignedLeads.length} new leads waiting to be claimed. Check the "New Leads" section to claim them.`
                : "New leads will appear here when they come in. You can claim them from the 'New Leads' section."
              }
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {currentUser?.full_name || 'Team Member'} • {leads.length} leads assigned to you
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {currentUser?.role === 'admin' && (
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          <Link to={createPageUrl("Leads")}>
            <Button variant="outline" className="bg-transparent border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-lg">
              <Plane className="w-4 h-4 mr-2" />
              View All Leads
            </Button>
          </Link>
          <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-lg">
            <Phone className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Only show stats and content when there are leads */}
      {leads.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Leads"
              value={getStats().totalLeads.length}
              change="+12%"
              trend="up"
              icon={Users}
              color="#3B82F6"
              onClick={() => handleStatCardClick('Total Leads', getStats().totalLeads)}
            />
            <StatsCard
              title="New Leads"
              value={getStats().newLeads.length}
              change="+5 today"
              trend="up"
              icon={AlertTriangle}
              color="#F59E0B"
              onClick={() => handleStatCardClick('New Leads', getStats().newLeads)}
            />
            <StatsCard
              title="Monthly Revenue"
              value={`$${getStats().monthlyRevenue.toLocaleString()}`}
              change="+18%"
              trend="up"
              icon={DollarSign}
              color="#10B981"
              onClick={() => handleStatCardClick('Booked This Month', getStats().monthlyBookedLeads)}
            />
            <StatsCard
              title="Monthly Profit"
              value={`$${getStats().monthlyProfit.toLocaleString()}`}
              change="+21%"
              trend="up"
              icon={TrendingUp}
              color="#8B5CF6"
              onClick={() => handleStatCardClick('Booked This Month', getStats().monthlyBookedLeads)}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <RecentLeads
                leads={leads.slice(0, 8)}
                isLoading={isLoading}
                onLeadClick={handleLeadClick}
              />
              <ActivityFeed leads={leads} />
            </div>

            <div className="space-y-6">
              {/* New Leads available to claim */}
              <NewLeadsCard
                leads={unassignedLeads}
                onClaimLead={handleClaimLead}
                onLeadClick={handleLeadClick}
              />

              <LeadCategoriesCard leads={leads} />

              <PriorityLeads
                leads={getStats().hotLeads}
                onLeadClick={handleLeadClick}
              />

              <Card className="bg-white border-[#E5DFD5] rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-[#1A1A1A]">
                    <Clock className="w-5 h-5 text-[#1A1A1A]" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-[#F5F2EC] text-[#1A1A1A] hover:bg-[#E5DFD5] rounded-lg border border-[#E5DFD5]">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Next Lead
                  </Button>
                  <Button className="w-full justify-start bg-[#F5F2EC] text-[#1A1A1A] hover:bg-[#E5DFD5] rounded-lg border border-[#E5DFD5]">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Follow-up
                  </Button>
                  <Link to={createPageUrl("Kanban")} className="block">
                    <Button className="w-full justify-start bg-[#F5F2EC] text-[#1A1A1A] hover:bg-[#E5DFD5] rounded-lg border border-[#E5DFD5]">
                      <Plane className="w-4 h-4 mr-2" />
                      Update Pipeline
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <LeadDetailModal
            lead={selectedLead}
            isOpen={showLeadModal}
            onClose={() => {
              setShowLeadModal(false);
              setSelectedLead(null);
            }}
            onLeadUpdate={loadLeads}
          />

          <InfoSlideOut
            isOpen={slideOut.isOpen}
            onClose={() => setSlideOut({ ...slideOut, isOpen: false })}
            title={slideOut.title}
          >
            {slideOut.data.length > 0 ? slideOut.data.map(lead => (
              <div
                key={lead.id}
                className="p-4 rounded-xl card-glass border-white/20 hover:bg-white/30 cursor-pointer transition-colors"
                onClick={() => handleSlideOutLeadClick(lead)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{lead.client?.full_name}</p>
                    {lead.trip?.legs?.[0] && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{lead.trip.legs[0].from_iata}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{lead.trip.legs[0].to_iata}</span>
                      </div>
                    )}
                  </div>
                  {lead.client_closing_price && (
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="font-semibold text-green-700">${lead.client_closing_price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Client Price</p>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No leads to display</p>
              </div>
            )}
          </InfoSlideOut>
        </>
      )}
    </div>
  );
}