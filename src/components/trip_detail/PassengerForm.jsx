import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadFile } from '@/api/integrations';
import { Upload, X } from 'lucide-react';

export default function PassengerForm({ passenger, onSave, onCancel }) {
    const [formData, setFormData] = useState(passenger || {
        full_name: '',
        dob: '',
        nationality: '',
        weight: '',
        passport_number: '',
        passport_expiry: '',
        passport_photo_url: ''
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setFormData(prev => ({ ...prev, passport_photo_url: file_url }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, passport_photo_url: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.full_name.trim()) {
            alert("Passenger name is required");
            return;
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" value={formData.full_name} onChange={handleChange} required/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g. British, American"/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="75"/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="passport_number">Passport Number</Label>
                    <Input id="passport_number" value={formData.passport_number} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="passport_expiry">Passport Expiry</Label>
                    <Input id="passport_expiry" type="date" value={formData.passport_expiry} onChange={handleChange} />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label>Passport Photo</Label>
                {formData.passport_photo_url ? (
                    <div className="space-y-2">
                        <div className="relative inline-block">
                            <img 
                                src={formData.passport_photo_url} 
                                alt="Passport Preview" 
                                className="h-32 w-auto rounded-md border object-cover" 
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={removePhoto}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" asChild>
                                <label htmlFor="passport-upload" className="cursor-pointer">
                                    <Upload className="w-4 h-4 mr-2" />
                                    {isUploading ? 'Uploading...' : 'Replace Photo'}
                                </label>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Input 
                            id="passport_photo_url" 
                            value={formData.passport_photo_url} 
                            onChange={handleChange} 
                            placeholder="Or paste image URL" 
                        />
                        <Button type="button" variant="outline" asChild>
                            <label htmlFor="passport-upload" className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </label>
                        </Button>
                    </div>
                )}
                <Input 
                    id="passport-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange} 
                    disabled={isUploading}
                />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Save Passenger'}
                </Button>
            </div>
        </form>
    );
}