
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, MapPin, ArrowRight, User, Building, Calendar } from 'lucide-react'; // Changed: Removed Ship, kept Building
import { format } from 'date-fns';

const tripStatusColors = {
    Scheduled: 'bg-blue-100 text-blue-800',
    'Pre-Flight Checks': 'bg-yellow-100 text-yellow-800',
    'In-Flight': 'bg-purple-100 text-purple-800',
    Landed: 'bg-teal-100 text-teal-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-gray-100 text-gray-800',
};

const demoOperators = ['NetJets', 'VistaJet', 'Flexjet', 'Wheels Up', 'XO'];

const aircraftTypes = {
    "Light Jet": [
        "Citation CJ3+",
        "Citation CJ4",
        "Hawker 400XP",
        "Phenom 300",
        "Learjet 75",
        "HondaJet",
        "Citation M2",
        "Embraer Phenom 100"
    ],
    "Midsize Jet": [
        "Hawker 800XP",
        "Hawker 900XP",
        "Learjet 60XR",
        "Citation XLS+",
        "Citation Sovereign",
        "Gulfstream G200",
        "Falcon 2000LX",
        "Embraer Legacy 450"
    ],
    "Heavy Jet": [
        "Challenger 650",
        "Challenger 350",
        "Gulfstream G450",
        "Gulfstream G550",
        "Falcon 7X",
        "Global 6000",
        "Citation X+",
        "Embraer Legacy 650"
    ],
    "Ultra Long Range": [
        "Gulfstream G650",
        "Gulfstream G700",
        "Global 7500",
        "Falcon 8X",
        "Citation Longitude",
        "Embraer Lineage 1000E"
    ]
};

export default function OverviewBlock({ trip, onUpdate, canEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState(trip.operational_details || {});
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        setDetails(trip.operational_details || {});
        
        // Find the category of the current aircraft type
        if (trip.operational_details?.aircraft_type) {
            for (const [category, types] of Object.entries(aircraftTypes)) {
                if (types.includes(trip.operational_details.aircraft_type)) {
                    setSelectedCategory(category);
                    break;
                }
            }
        }
    }, [trip.operational_details]);

    const handleSave = () => {
        onUpdate({ operational_details: details });
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setDetails(trip.operational_details || {});
        setSelectedCategory('');
        setIsEditing(false);
    }

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        // Clear aircraft type when category changes
        setDetails({...details, aircraft_type: '' });
    };

    return (
        <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Plane /> Trip Overview</CardTitle>
                {canEdit && !isEditing && <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <MapPin className="w-6 h-6 text-purple-600"/>
                        <span className="font-bold text-2xl">{trip.trip.legs[0].from_iata}</span>
                        <ArrowRight/>
                        <span className="font-bold text-2xl">{trip.trip.legs[0].to_iata}</span>
                    </div>
                    <Badge className={tripStatusColors[trip.trip_status]}>{trip.trip_status}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><User className="w-4 h-4" /> Client</p>
                        <p className="font-semibold">{trip.client.full_name}</p>
                    </div>
                    <div>
                        {/* The Calendar icon is already present here, fulfilling the request */}
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Departure</p>
                        <p className="font-semibold">{format(new Date(trip.trip.legs[0].depart_iso), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    {isEditing ? (
                        <>
                            <div className="space-y-3 col-span-2">
                                <div className="space-y-1">
                                    <Label htmlFor="aircraft_category">Aircraft Category</Label>
                                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                        <SelectTrigger><SelectValue placeholder="Select Category First" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(aircraftTypes).map(category => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-1">
                                    <Label htmlFor="aircraft_type">Aircraft Type</Label>
                                    <Select 
                                        value={details.aircraft_type || ''} 
                                        onValueChange={(value) => setDetails({...details, aircraft_type: value })}
                                        disabled={!selectedCategory}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={selectedCategory ? "Select Aircraft" : "Select Category First"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedCategory && aircraftTypes[selectedCategory].map(aircraft => (
                                                <SelectItem key={aircraft} value={aircraft}>{aircraft}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-1">
                                    <Label htmlFor="tail_number">Tail Number</Label>
                                    <Input id="tail_number" value={details.tail_number || ''} onChange={(e) => setDetails({...details, tail_number: e.target.value })} placeholder="N123AB" />
                                </div>
                                
                                <div className="space-y-1">
                                    <Label htmlFor="operator_name">Operator</Label>
                                    <Select value={details.operator_name || ''} onValueChange={(value) => setDetails({...details, operator_name: value })}>
                                        <SelectTrigger><SelectValue placeholder="Select Operator" /></SelectTrigger>
                                        <SelectContent>
                                            {demoOperators.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><Plane className="w-4 h-4" /> Aircraft</p> {/* Changed: Ship icon replaced with Plane icon */}
                                <p className="font-semibold">{trip.operational_details?.aircraft_type || 'TBD'}</p>
                                <p className="text-xs text-gray-500">{trip.operational_details?.tail_number || 'No tail number'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><Building className="w-4 h-4" /> Operator</p>
                                <p className="font-semibold">{trip.operational_details?.operator_name || 'TBD'}</p>
                            </div>
                        </>
                    )}
                </div>
                {isEditing && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave}>Save Details</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
