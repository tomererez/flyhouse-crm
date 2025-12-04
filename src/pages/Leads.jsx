import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download,
  Plus,
  Users,
  Plane
} from "lucide-react";
import { addDays, isAfter, isBefore, startOfDay } from "date-fns";

import LeadsTable from "../components/leads/LeadsTable";
import ClientsTable from "../components/leads/ClientsTable";
import FilterBar from "../components/shared/FilterBar";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    clientTier: 'all',
    departureRange: 'all',
    requestRange: 'all'
  });
  const [sortBy, setSortBy] = useState('request_desc');

  useEffect(() => {
    // Read URL params for initial filters
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    const priorityParam = urlParams.get('priority');
    
    if (statusParam || priorityParam) {
      setFilters(prev => ({
        ...prev,
        status: statusParam || 'all',
        priority: priorityParam || 'all'
      }));
    }
    
    loadLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, searchTerm, filters, sortBy]);

  const loadLeads = async () => {
    try {
      const data = await Lead.list('-created_date');
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isWithinDateRange = (dateStr, range, isFuture = true) => {
    if (!dateStr || range === 'all') return true;
    const date = new Date(dateStr);
    const today = startOfDay(new Date());
    
    if (isFuture) {
      switch (range) {
        case 'next_7':
          return isAfter(date, today) && isBefore(date, addDays(today, 7));
        case 'next_14':
          return isAfter(date, today) && isBefore(date, addDays(today, 14));
        case 'next_30':
          return isAfter(date, today) && isBefore(date, addDays(today, 30));
        default:
          return true;
      }
    } else {
      switch (range) {
        case 'past_7':
          return isAfter(date, addDays(today, -7));
        case 'past_14':
          return isAfter(date, addDays(today, -14));
        case 'past_30':
          return isAfter(date, addDays(today, -30));
        default:
          return true;
      }
    }
  };

  const applyFilters = () => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.trip?.legs?.[0]?.from_iata?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.trip?.legs?.[0]?.to_iata?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(lead => lead.priority === filters.priority);
    }

    // Client tier filter
    if (filters.clientTier !== 'all') {
      filtered = filtered.filter(lead => lead.client?.client_tier === filters.clientTier);
    }

    // Departure range filter
    if (filters.departureRange !== 'all') {
      filtered = filtered.filter(lead => {
        const departDate = lead.trip?.legs?.[0]?.depart_iso;
        return isWithinDateRange(departDate, filters.departureRange, true);
      });
    }

    // Request range filter
    if (filters.requestRange !== 'all') {
      filtered = filtered.filter(lead => 
        isWithinDateRange(lead.created_date, filters.requestRange, false)
      );
    }

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

    setFilteredLeads(filtered);
  };

  const handleExport = async () => {
    try {
      const csvContent = [
        ['ID', 'Client Name', 'Email', 'Phone', 'Route', 'Passengers', 'Status', 'Priority', 'Created Date', 'Price Range'].join(','),
        ...filteredLeads.map(lead => [
          lead.id,
          lead.client?.full_name || '',
          lead.client?.email || '',
          lead.client?.phone_e164 || '',
          lead.trip?.legs?.[0] ? `${lead.trip.legs[0].from_iata} → ${lead.trip.legs[0].to_iata}` : '',
          lead.trip?.pax || '',
          lead.status,
          lead.priority,
          new Date(lead.created_date).toLocaleDateString(),
          lead.estimate?.price_max ? `$${lead.estimate.price_min?.toLocaleString()} - $${lead.estimate.price_max?.toLocaleString()}` : ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">All Clients</h1>
          <p className="text-[#6B6B6B] mt-1">
            Track and manage all clients and flights
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-lg">
            <Plus className="w-4 h-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="bg-white border border-[#E5DFD5] p-1 rounded-xl">
          <TabsTrigger 
            value="clients" 
            className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white rounded-lg px-6"
          >
            <Users className="w-4 h-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger 
            value="flights"
            className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white rounded-lg px-6"
          >
            <Plane className="w-4 h-4 mr-2" />
            All Flights
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="mt-4">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showClientTier={true}
          />
        </div>

        <TabsContent value="clients" className="mt-4">
          <ClientsTable 
            leads={filteredLeads}
            isLoading={isLoading}
            onLeadUpdate={loadLeads}
          />
        </TabsContent>

        <TabsContent value="flights" className="mt-4">
          <LeadsTable 
            leads={filteredLeads}
            isLoading={isLoading}
            onLeadUpdate={loadLeads}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}