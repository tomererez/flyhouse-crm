import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Users as UsersIcon,
  DollarSign,
  ExternalLink,
  MoreHorizontal,
  Calendar,
  TrendingUp // Added TrendingUp icon
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import LeadDetailModal from "../kanban/LeadDetailModal";

import { statusColors, priorityColors } from "../utils/ColorConfig";

export default function LeadsTable({ leads, isLoading, onLeadUpdate }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleRowClick = (lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedLead(null);
  };

  const handleLeadUpdate = () => {
    onLeadUpdate();
    // Keep modal open but refresh data
  };

  if (isLoading) {
    return (
      <Card className="card-glass">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>Client</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Client Price</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(8).fill(0).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-glass">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-gray-700 font-semibold">Client</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Route</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Departure Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Priority</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Client Price</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Profit (Margin)</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Created</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  const profit = (lead.client_closing_price || 0) - (lead.operator_closing_price || 0);
                  const profitMargin = lead.client_closing_price ? (profit / lead.client_closing_price) * 100 : 0;

                  return (
                    <TableRow
                      key={lead.id}
                      className="border-white/5 hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                      onClick={() => handleRowClick(lead)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {lead.client?.full_name?.[0]?.toUpperCase() || 'L'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {lead.client?.full_name || 'Unknown Client'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {lead.client?.email}
                            </p>
                            {lead.client?.phone_e164 && (
                              <p className="text-xs text-gray-500">
                                {lead.client.phone_e164}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {lead.trip?.legs?.[0] ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="font-mono font-semibold">
                                {lead.trip.legs[0].from_iata}
                              </span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="font-mono font-semibold">
                                {lead.trip.legs[0].to_iata}
                              </span>
                            </div>
                            {lead.trip.pax && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <UsersIcon className="w-3 h-3" />
                                <span>{lead.trip.pax}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No route</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {lead.trip?.legs?.[0]?.depart_iso ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-purple-600" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {format(new Date(lead.trip.legs[0].depart_iso), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(lead.trip.legs[0].depart_iso), 'HH:mm')}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No date</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className={`${statusColors[lead.status]?.badge} border text-xs`}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className={`${priorityColors[lead.priority]?.badge} border text-xs`}>
                          {lead.priority}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {lead.client_closing_price ? (
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="w-3 h-3 text-gray-500" />
                            <span className="font-medium text-gray-800">
                              ${lead.client_closing_price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {lead.client_closing_price && lead.operator_closing_price ? (
                          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <div>
                              <div>${profit.toLocaleString()}</div>
                              <div className="text-xs text-green-500">{profitMargin.toFixed(1)}%</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {format(new Date(lead.created_date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-gray-400">
                          {format(new Date(lead.created_date), 'HH:mm')}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="card-glass border-white/20">
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (lead.client?.phone_e164) {
                                  window.open(`tel:${lead.client.phone_e164}`);
                                }
                              }}
                            >
                              <Phone className="w-4 h-4" />
                              Call Client
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (lead.client?.email) {
                                  window.open(`mailto:${lead.client.email}`);
                                }
                              }}
                            >
                              <Mail className="w-4 h-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(lead);
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {leads.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onLeadUpdate={handleLeadUpdate}
      />
    </>
  );
}