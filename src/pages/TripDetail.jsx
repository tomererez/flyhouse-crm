import React, { useState, useEffect } from 'react';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';

import OverviewBlock from '@/components/trip_detail/OverviewBlock';
import PassengersBlock from '@/components/trip_detail/PassengersBlock';
import DocumentsBlock from '@/components/trip_detail/DocumentsBlock';
import ServicesBlock from '@/components/trip_detail/ServicesBlock';
import ActivityBlock from '@/components/trip_detail/ActivityBlock';

export default function TripDetail() {
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id');

    if (!tripId) {
      setError('No trip ID provided.');
      setIsLoading(false);
      return;
    }

    loadTrip(tripId);
  }, []);

  const loadTrip = async (tripId) => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      const tripData = await Lead.get(tripId);
      setTrip(tripData);
    } catch (e) {
      setError('Failed to load trip details.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTrip = async (updatedData) => {
    if (!trip) return;
    try {
      await Lead.update(trip.id, updatedData);
      // Reload the trip to get the latest data
      const updatedTrip = await Lead.get(trip.id);
      setTrip(updatedTrip);
    } catch (e) {
      console.error("Failed to update trip:", e);
      // Optionally show an error to the user
    }
  };

  // Allow editing for ops, admin, and brokers (everyone can edit trip details)
  const canEdit = true; // For now, allow all users to edit

  if (isLoading) return <div className="p-6 text-center">Loading trip details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!trip) return <div className="p-6 text-center">Trip not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Sheet</h1>
          <p className="text-gray-600 mt-1">Operator: {trip.operational_details?.operator_name || 'TBD'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Email Trip Sheet</Button>
          <Button onClick={() => window.print()}>Print / Save as PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OverviewBlock trip={trip} onUpdate={handleUpdateTrip} canEdit={canEdit} />
          <PassengersBlock trip={trip} onUpdate={handleUpdateTrip} canEdit={canEdit} />
          <DocumentsBlock trip={trip} onUpdate={handleUpdateTrip} canEdit={canEdit} />
          <ServicesBlock trip={trip} onUpdate={handleUpdateTrip} canEdit={canEdit} />
        </div>
        <div className="space-y-6">
          <ActivityBlock trip={trip} onUpdate={handleUpdateTrip} canEdit={canEdit} />
        </div>
      </div>
    </div>
  );
}