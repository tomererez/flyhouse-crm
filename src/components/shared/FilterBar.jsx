import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown, X } from "lucide-react";

export default function FilterBar({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFiltersChange,
  sortBy,
  onSortChange,
  showClientTier = false
}) {
  const hasActiveFilters = filters.status !== 'all' || 
    filters.priority !== 'all' || 
    filters.clientTier !== 'all' || 
    filters.departureRange !== 'all' || 
    filters.requestRange !== 'all';

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      clientTier: 'all',
      departureRange: 'all',
      requestRange: 'all'
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5DFD5]">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
        <Input
          placeholder="Search by name, email, route..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-[#E5DFD5] rounded-lg"
        />
      </div>

      <div className="h-6 w-px bg-[#E5DFD5]" />

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#6B6B6B]">Status:</span>
        <Select value={filters.status} onValueChange={(v) => onFiltersChange({...filters, status: v})}>
          <SelectTrigger className="w-32 border-[#E5DFD5] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="pending_client">Pending</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="flown">Flown</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#6B6B6B]">Priority:</span>
        <Select value={filters.priority} onValueChange={(v) => onFiltersChange({...filters, priority: v})}>
          <SelectTrigger className="w-28 border-[#E5DFD5] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="hot">🔥 Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Tier Filter */}
      {showClientTier && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#6B6B6B]">Client:</span>
          <Select value={filters.clientTier} onValueChange={(v) => onFiltersChange({...filters, clientTier: v})}>
            <SelectTrigger className="w-28 border-[#E5DFD5] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="retainer">Retainer</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Departure Range Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#6B6B6B]">Departure:</span>
        <Select value={filters.departureRange} onValueChange={(v) => onFiltersChange({...filters, departureRange: v})}>
          <SelectTrigger className="w-32 border-[#E5DFD5] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="next_7">Next 7 days</SelectItem>
            <SelectItem value="next_14">Next 14 days</SelectItem>
            <SelectItem value="next_30">Next 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Request Range Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#6B6B6B]">Request:</span>
        <Select value={filters.requestRange} onValueChange={(v) => onFiltersChange({...filters, requestRange: v})}>
          <SelectTrigger className="w-32 border-[#E5DFD5] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="past_7">Last 7 days</SelectItem>
            <SelectItem value="past_14">Last 14 days</SelectItem>
            <SelectItem value="past_30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-6 w-px bg-[#E5DFD5]" />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3 h-3 text-[#6B6B6B]" />
        <span className="text-xs font-medium text-[#6B6B6B]">Sort:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-40 border-[#E5DFD5] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="request_desc">Request (Newest)</SelectItem>
            <SelectItem value="request_asc">Request (Oldest)</SelectItem>
            <SelectItem value="departure_asc">Departure (Soonest)</SelectItem>
            <SelectItem value="departure_desc">Departure (Latest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearFilters}
          className="text-[#6B6B6B] hover:text-[#1A1A1A] h-8 text-xs"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}