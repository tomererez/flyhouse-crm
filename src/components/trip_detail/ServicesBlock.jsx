import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

export default function ServicesBlock({ trip, onUpdate, canEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState({
        catering_notes: trip.catering_notes || '',
        ground_transport_notes: trip.ground_transport_notes || '',
    });

    useEffect(() => {
        setNotes({
            catering_notes: trip.catering_notes || '',
            ground_transport_notes: trip.ground_transport_notes || '',
        });
    }, [trip]);

    const handleSave = () => {
        onUpdate(notes);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setNotes({
            catering_notes: trip.catering_notes || '',
            ground_transport_notes: trip.ground_transport_notes || '',
        });
        setIsEditing(false);
    }

    return (
        <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Star/> Special Services</CardTitle>
                 {canEdit && !isEditing && <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>}
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label className="font-semibold">Catering Notes</Label>
                    <Textarea 
                        value={notes.catering_notes} 
                        onChange={(e) => setNotes({...notes, catering_notes: e.target.value })}
                        disabled={!isEditing} 
                        className="mt-1"
                        rows={4}
                    />
                 </div>
                 <div>
                    <Label className="font-semibold">Ground Transport Notes</Label>
                    <Textarea 
                        value={notes.ground_transport_notes}
                        onChange={(e) => setNotes({...notes, ground_transport_notes: e.target.value })}
                        disabled={!isEditing} 
                        className="mt-1"
                        rows={4}
                    />
                 </div>
                 {isEditing && (
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave}>Save Services</Button>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}