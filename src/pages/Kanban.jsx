import React, { useState, useEffect } from "react";
import { Lead, User } from "@/api/entities";
import { DragDropContext } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
// import { analyzeAllLeadsPriority } from "@/api/functions";
const analyzeAllLeadsPriority = async () => new Promise(resolve => setTimeout(resolve, 1000)); // Mock
import { addDays, isAfter, isBefore, startOfDay } from "date-fns";

import KanbanColumn from "../components/kanban/KanbanColumn";
import LeadDetailModal from "../components/kanban/LeadDetailModal";
import FilterBar from "../components/shared/FilterBar";

const COLUMNS = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500' },
  { id: 'qualified', title: 'Qualified', color: 'bg-purple-500' },
  { id: 'quoted', title: 'Quoted', color: 'bg-indigo-500' },
  { id: 'pending_client', title: 'Pending Client', color: 'bg-orange-500' },
  { id: 'booked', title: 'Booked', color: 'bg-green-500' },
  { id: 'flown', title: 'Flown', color: 'bg-emerald-500' },
  { id: 'lost', title: 'Lost', color: 'bg-gray-500' }
];

export default function Kanban() {
  const [leads, setLeads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    clientTier: 'all',
    departureRange: 'all',
    requestRange: 'all'
  });
  const [sortBy, setSortBy] = useState('request_desc');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const [data, me] = await Promise.all([
        Lead.list('-created_date'),
        User.currentUser()
      ]);
      setCurrentUser(me);
      // Filter leads: show only MY leads (assigned to me by ID or email)
      const myLeads = data.filter(l =>
        l.owner_user_id === me.id ||
        l.owner_email === me.email ||
        l.created_by === me.email
      );
      setLeads(myLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAiPrioritization = async () => {
    setIsAiAnalyzing(true);
    try {
      await analyzeAllLeadsPriority({});
      await loadLeads();
    } catch (error) {
      console.error('Error running AI prioritization:', error);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const leadId = draggableId;
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    try {
      // Optimistic update
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId
            ? { ...lead, status: newStatus }
            : lead
        )
      );

      // Update database
      await Lead.update(leadId, { status: newStatus });

    } catch (error) {
      console.error('Error updating lead status:', error);

      // Revert on error
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId
            ? { ...lead, status: oldStatus }
            : lead
        )
      );
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const isWithinDateRange = (dateStr, range) => {
    if (!dateStr || range === 'all') return true;
    const date = new Date(dateStr);
    const today = startOfDay(new Date());

    switch (range) {
      case 'next_7':
        return isAfter(date, today) && isBefore(date, addDays(today, 7));
      case 'next_14':
        return isAfter(date, today) && isBefore(date, addDays(today, 14));
      case 'next_30':
        return isAfter(date, today) && isBefore(date, addDays(today, 30));
      case 'past_7':
        return isAfter(date, addDays(today, -7)) && isBefore(date, today);
      case 'past_14':
        return isAfter(date, addDays(today, -14)) && isBefore(date, today);
      case 'past_30':
        return isAfter(date, addDays(today, -30)) && isBefore(date, today);
      default:
        return true;
    }
  };

  const applyFiltersToLeads = (leadsToFilter) => {
    let filtered = leadsToFilter.filter(lead => {
      // Priority filter
      if (filters.priority !== 'all' && lead.priority !== filters.priority) return false;

      // Client tier filter
      if (filters.clientTier !== 'all' && lead.client?.client_tier !== filters.clientTier) return false;

      // Departure date filter
      const departDate = lead.trip?.legs?.[0]?.depart_iso;
      if (!isWithinDateRange(departDate, filters.departureRange)) return false;

      // Request date filter
      if (!isWithinDateRange(lead.created_date, filters.requestRange)) return false;

      // Search filter
      if (searchTerm !== "" &&
        !lead.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !lead.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !lead.trip?.legs?.[0]?.from_iata?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !lead.trip?.legs?.[0]?.to_iata?.toLowerCase().includes(searchTerm.toLowerCase())
      ) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'request_desc':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'request_asc':
          return new Date(a.created_date) - new Date(b.created_date);
        case 'departure_desc':
          const dateA = a.trip?.legs?.[0]?.depart_iso;
          const dateB = b.trip?.legs?.[0]?.depart_iso;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return new Date(dateB) - new Date(dateA);
        case 'departure_asc':
          const dA = a.trip?.legs?.[0]?.depart_iso;
          const dB = b.trip?.legs?.[0]?.depart_iso;
          if (!dA) return 1;
          if (!dB) return -1;
          return new Date(dA) - new Date(dB);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getLeadsByStatus = (status) => {
    const statusLeads = leads.filter(lead => lead.status === status);
    return applyFiltersToLeads(statusLeads);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Pipeline</h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.full_name || 'Team Member'} • {leads.length} leads assigned to you
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="card-glass border-white/20 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200"
              onClick={runAiPrioritization}
              disabled={isAiAnalyzing}
            >
              <Sparkles className={`w-4 h-4 mr-2 text-purple-600 ${isAiAnalyzing ? 'animate-pulse' : ''}`} />
              {isAiAnalyzing ? 'AI Analyzing...' : 'AI Prioritize'}
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          showClientTier={true}
        />
        <div className="mb-4" />
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
          <div className="flex gap-6 h-full" style={{ width: 'max-content', minWidth: '100%' }}>
            {COLUMNS.map((column) => {
              const columnLeads = getLeadsByStatus(column.id);

              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  leads={columnLeads}
                  isLoading={isLoading}
                  onLeadClick={handleLeadClick}
                />
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setSelectedLead(null);
        }}
        onLeadUpdate={loadLeads}
      />
    </div>
  );
}