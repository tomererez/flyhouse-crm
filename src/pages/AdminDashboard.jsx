import React, { useState, useEffect } from "react";
import { Lead, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  DollarSign,
  Plane,
  AlertTriangle,
  UserCheck,
  Clock,
  BarChart3,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatsCard from "../components/dashboard/StatsCard";
import TeamPerformanceCard from "../components/admin/TeamPerformanceCard";
import UnassignedLeadsCard from "../components/admin/UnassignedLeadsCard";
import LeadDetailModal from "../components/kanban/LeadDetailModal";

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leadsData, usersData, me] = await Promise.all([
        Lead.list('-created_date', 200),
        User.list(),
        User.currentUser()
      ]);
      setLeads(leadsData);
      setUsers(usersData);
      setCurrentUser(me);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-700">You need admin privileges to view this page.</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="mt-4">Go to My Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unassignedLeads = leads.filter(l => !l.owner_user_id);
  const assignedLeads = leads.filter(l => l.owner_user_id);

  // Stats
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const monthlyBookedLeads = leads.filter(lead =>
    (lead.status === 'booked' || lead.status === 'flown') &&
    new Date(lead.updated_date) >= startOfMonth &&
    lead.client_closing_price && lead.operator_closing_price
  );

  const monthlyRevenue = monthlyBookedLeads.reduce((sum, lead) => sum + (lead.client_closing_price || 0), 0);
  const totalOperatorCost = monthlyBookedLeads.reduce((sum, lead) => sum + (lead.operator_closing_price || 0), 0);
  const monthlyProfit = monthlyRevenue - totalOperatorCost;

  // Team performance
  const teamPerformance = users.map(user => {
    const userLeads = leads.filter(l => l.owner_user_id === user.id);
    const bookedLeads = userLeads.filter(l => l.status === 'booked' || l.status === 'flown');
    const revenue = bookedLeads.reduce((sum, l) => sum + (l.client_closing_price || 0), 0);
    const profit = bookedLeads.reduce((sum, l) => sum + ((l.client_closing_price || 0) - (l.operator_closing_price || 0)), 0);

    return {
      ...user,
      totalLeads: userLeads.length,
      bookedLeads: bookedLeads.length,
      revenue,
      profit,
      conversionRate: userLeads.length > 0 ? (bookedLeads.length / userLeads.length * 100).toFixed(1) : 0
    };
  }).filter(u => u.totalLeads > 0).sort((a, b) => b.revenue - a.revenue);

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Admin Dashboard</h1>
            <Badge className="bg-red-100 text-red-800 border-red-200">Admin</Badge>
          </div>
          <p className="text-[#6B6B6B] mt-1">Overview of all team performance and leads</p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("Analytics")}>
            <Button variant="outline" className="border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-white rounded-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-lg">
              <Eye className="w-4 h-4 mr-2" />
              My Dashboard
            </Button>
          </Link>
          <Link to={createPageUrl("Team")}>
            <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Leads"
          value={leads.length}
          icon={Plane}
          color="#3B82F6"
        />
        <StatsCard
          title="Unassigned"
          value={unassignedLeads.length}
          icon={AlertTriangle}
          color="#F59E0B"
        />
        <StatsCard
          title="Team Members"
          value={users.length}
          icon={Users}
          color="#8B5CF6"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="#10B981"
        />
        <StatsCard
          title="Monthly Profit"
          value={`$${monthlyProfit.toLocaleString()}`}
          icon={TrendingUp}
          color="#06B6D4"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Unassigned Leads */}
        <div className="lg:col-span-1">
          <UnassignedLeadsCard
            leads={unassignedLeads}
            users={users}
            onLeadClick={handleLeadClick}
            onLeadUpdate={loadData}
          />
        </div>

        {/* Team Performance */}
        <div className="lg:col-span-2">
          <TeamPerformanceCard
            teamPerformance={teamPerformance}
            leads={leads}
          />
        </div>
      </div>

      <LeadDetailModal
        lead={selectedLead}
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setSelectedLead(null);
        }}
        onLeadUpdate={loadData}
      />
    </div>
  );
}