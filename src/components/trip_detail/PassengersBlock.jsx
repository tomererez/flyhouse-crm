import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Edit, Trash2, User as UserIcon } from 'lucide-react';
import PassengerForm from './PassengerForm';

export default function PassengersBlock({ trip, onUpdate, canEdit }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPassenger, setEditingPassenger] = useState(null);

    const handleSavePassenger = (passengerData) => {
        let updatedPassengers = [...(trip.passengers || [])];
        
        if (editingPassenger !== null) {
            // Editing existing passenger
            updatedPassengers[editingPassenger] = passengerData;
        } else {
            // Adding new passenger
            updatedPassengers.push(passengerData);
        }
        
        onUpdate({ passengers: updatedPassengers });
        setIsFormOpen(false);
        setEditingPassenger(null);
    };

    const handleEdit = (passenger, index) => {
        setEditingPassenger(index);
        setIsFormOpen(true);
    };

    const handleDelete = (index) => {
        const updatedPassengers = trip.passengers.filter((_, i) => i !== index);
        onUpdate({ passengers: updatedPassengers });
    };

    return (
        <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Users/> Passengers ({trip.passengers?.length || 0})
                </CardTitle>
                {canEdit && (
                    <Dialog open={isFormOpen} onOpenChange={(open) => { 
                        setIsFormOpen(open); 
                        if (!open) setEditingPassenger(null); 
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus className="w-4 h-4 mr-2"/>Add Passenger
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPassenger !== null ? 'Edit' : 'Add'} Passenger
                                </DialogTitle>
                            </DialogHeader>
                            <PassengerForm
                                passenger={editingPassenger !== null ? trip.passengers[editingPassenger] : null}
                                onSave={handleSavePassenger}
                                onCancel={() => { 
                                    setIsFormOpen(false); 
                                    setEditingPassenger(null); 
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                {trip.passengers && trip.passengers.length > 0 ? (
                    <ul className="space-y-3">
                        {trip.passengers.map((p, i) => (
                            <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/30">
                                <div className="flex items-center gap-3">
                                    <UserIcon className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="font-semibold">{p.full_name}</p>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>Nationality: {p.nationality || 'N/A'} • Weight: {p.weight ? `${p.weight} kg` : 'N/A'}</div>
                                            {p.dob && <div>DOB: {p.dob}</div>}
                                            {p.passport_number && <div>Passport: {p.passport_number}</div>}
                                        </div>
                                    </div>
                                </div>
                                {canEdit && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p, i)}>
                                            <Edit className="w-4 h-4"/>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(i)}>
                                            <Trash2 className="w-4 h-4 text-red-500"/>
                                        </Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-4">No passenger details provided.</p>
                )}
            </CardContent>
        </Card>
    );
}