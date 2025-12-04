
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lead } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  List,
  Calendar,
  Search,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfMonth, endOfMonth, getDay } from 'date-fns';

const tripStatusColors = {
  Scheduled: 'bg-blue-100 text-blue-800',
  'Pre-Flight Checks': 'bg-yellow-100 text-yellow-800',
  'In-Flight': 'bg-purple-100 text-purple-800',
  Landed: 'bg-teal-100 text-teal-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-800',
};

const FlightsList = ({ flights }) => (
  <div className="space-y-4">
    {flights.map((flight) => (
      <Link
        to={createPageUrl(`TripDetail?id=${flight.id}`)}
        key={flight.id}
        className="block"
      >
        <Card className="card-glass hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 items-center gap-4">
            <div className="md:col-span-2">
              <p className="font-bold text-lg text-gray-900">
                {flight.trip.legs[0].from_iata} → {flight.trip.legs[0].to_iata}
              </p>
              <p className="text-sm text-gray-600">
                {flight.client.full_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Departure</p>
              <p className="font-semibold text-gray-800">
                {format(new Date(flight.trip.legs[0].depart_iso), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Aircraft</p>
              <p className="font-semibold text-gray-800">
                {flight.operational_details?.aircraft_type || 'TBD'}
              </p>
            </div>
            <div className="flex justify-end">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tripStatusColors[flight.trip_status]}`}>
                    {flight.trip_status}
                </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    ))}
  </div>
);

const FlightsCalendar = ({ flights }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
  
    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
    const startingDayOfWeek = getDay(firstDayOfMonth) === 0 ? 6 : getDay(firstDayOfMonth) - 1;
  
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
    return (
      <Card className="card-glass p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>Prev</Button>
          <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
          <Button variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next</Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="text-center font-medium text-sm text-gray-600 py-2">{day}</div>
          ))}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="border-t border-r border-gray-200/50" />
          ))}
          {daysInMonth.map(day => {
            const flightsOnDay = flights.filter(f => isSameDay(new Date(f.trip.legs[0].depart_iso), day));
            return (
              <div key={day.toString()} className={`border-t border-r border-gray-200/50 p-2 min-h-[120px] ${isSameMonth(day, currentDate) ? 'bg-white/30' : 'bg-gray-50/20'}`}>
                <div className="font-semibold text-sm text-right">{format(day, 'd')}</div>
                <div className="space-y-1 mt-1">
                  {flightsOnDay.map(flight => (
                     <Link to={createPageUrl(`TripDetail?id=${flight.id}`)} key={flight.id} className="block bg-blue-100 text-blue-800 p-1 rounded-md text-xs cursor-pointer hover:bg-blue-200 truncate">
                       {flight.trip.legs[0].from_iata}-{flight.trip.legs[0].to_iata}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };
  

export default function UpcomingFlightsConsole() {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBookedFlights();
  }, []);

  useEffect(() => {
    let filtered = flights.filter(flight => {
        const clientMatch = flight.client.full_name.toLowerCase().includes(searchTerm.toLowerCase());
        const routeMatch = `${flight.trip.legs[0].from_iata} ${flight.trip.legs[0].to_iata}`.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === 'all' || flight.trip_status === statusFilter;
        return (clientMatch || routeMatch) && statusMatch;
    });
    setFilteredFlights(filtered);
  }, [searchTerm, statusFilter, flights]);

  const loadBookedFlights = async () => {
    setIsLoading(true);
    try {
      const allLeads = await Lead.list();
      const booked = allLeads
        .filter(lead => ['booked', 'flown'].includes(lead.status) && lead.trip?.legs?.[0]?.depart_iso)
        .sort((a, b) => new Date(a.trip.legs[0].depart_iso) - new Date(b.trip.legs[0].depart_iso));
      setFlights(booked);
      setFilteredFlights(booked);
    } catch (error) {
      console.error('Error loading booked flights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Flights Console</h1>
          <p className="text-gray-600 mt-1">Run every booked trip from now to wheels-down.</p>
        </div>
        <div className="flex items-center gap-2">
            <Link to={createPageUrl("Leads")}>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> New Trip
                </Button>
            </Link>
        </div>
      </div>
      
      <Card className="card-glass p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
                placeholder="Search by client or route..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(tripStatusColors).map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 p-1 rounded-lg card-glass self-start">
            <Button onClick={() => setViewMode('list')} variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="gap-2">
              <List className="w-4 h-4" /> List
            </Button>
            <Button onClick={() => setViewMode('calendar')} variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} size="sm" className="gap-2">
              <Calendar className="w-4 h-4" /> Calendar
            </Button>
          </div>
        </div>
      </Card>
      
      {isLoading ? (
        <p>Loading flights...</p>
      ) : viewMode === 'list' ? (
        <FlightsList flights={filteredFlights} />
      ) : (
        <FlightsCalendar flights={filteredFlights} />
      )}
    </div>
  );
}
