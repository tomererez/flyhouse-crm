import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Upload, CheckCircle2, XCircle, Trash2, FileText } from 'lucide-react';
import { UploadFile } from '@/api/integrations';

const requiredDocs = [
    { key: 'Quote', label: 'Quote' },
    { key: 'Client Contract', label: 'Client Contract' },
    { key: 'Operator Contract', label: 'Operator Contract' },
    { key: 'Final Trip Sheet', label: 'Final Trip Sheet (from Operator)' },
    { key: 'Trip Sheet PDF', label: 'Trip Sheet PDF (Generated)' }
];

export default function DocumentsBlock({ trip, onUpdate, canEdit }) {
    const [isUploading, setIsUploading] = useState(null);

    const handleFileUpload = async (e, category) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(category);
        try {
            const { file_url } = await UploadFile({ file });
            const newFile = {
                name: file.name,
                url: file_url,
                type: file.type,
                category: category,
            };
            const otherFiles = trip.files?.filter(f => f.category !== category) || [];
            onUpdate({ files: [...otherFiles, newFile] });
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(null);
        }
    };
    
    const handleDelete = (category) => {
        const updatedFiles = trip.files?.filter(f => f.category !== category) || [];
        onUpdate({ files: updatedFiles });
    };

    return (
        <Card className="card-glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Paperclip/> Documents Checklist</CardTitle></CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {requiredDocs.map(doc => {
                        const file = trip.files?.find(f => f.category === doc.key);
                        return (
                            <li key={doc.key} className="flex items-center justify-between p-3 rounded-lg bg-white/30">
                                <div className="flex items-center gap-3">
                                    {file ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                    <div>
                                        <p className="font-semibold">{doc.label}</p>
                                        {file ? (
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">{file.name}</a>
                                        ) : (
                                            <p className="text-sm text-gray-500">Not uploaded</p>
                                        )}
                                    </div>
                                </div>
                                {canEdit && (
                                    <div className="flex items-center gap-2">
                                        {file && (
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.key)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" asChild>
                                            <label htmlFor={`upload-${doc.key}`} className="cursor-pointer">
                                                <Upload className="w-4 h-4 mr-2" />
                                                {isUploading === doc.key ? 'Uploading...' : (file ? 'Replace' : 'Upload')}
                                            </label>
                                        </Button>
                                        <Input id={`upload-${doc.key}`} type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc.key)} disabled={isUploading === doc.key} />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}