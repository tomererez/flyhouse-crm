import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityBlock({ trip, onUpdate, canEdit }) {
    const [newNote, setNewNote] = useState('');

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        
        const note = {
            user_id: 'current_user_id', // This should be replaced with actual user ID
            text: newNote,
            timestamp: new Date().toISOString()
        };

        const updatedNotes = [...(trip.notes || []), note];
        onUpdate({ notes: updatedNotes });
        setNewNote('');
    };

    return (
        <Card className="card-glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare/> Activity</CardTitle></CardHeader>
            <CardContent>
                {canEdit && (
                    <div className="flex gap-2 mb-4">
                        <Textarea 
                            placeholder="Add a comment or log an activity..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                        <Button onClick={handleAddNote} disabled={!newNote.trim()}><Send/></Button>
                    </div>
                )}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {trip.notes && trip.notes.length > 0 ? (
                        [...trip.notes].reverse().map((note, i) => (
                            <div key={i} className="p-3 bg-white/30 rounded-lg">
                                <p className="text-sm">{note.text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {note.user_id} • {format(new Date(note.timestamp), 'MMM dd, HH:mm')}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No activity logged yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}