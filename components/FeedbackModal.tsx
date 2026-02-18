'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: any) => void;
    item: any;
}

export function FeedbackModal({ isOpen, onClose, onSubmit, item }: FeedbackModalProps) {
    const [field, setField] = useState('workCenter');
    const [correctedValue, setCorrectedValue] = useState('');
    const [reasoning, setReasoning] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const feedback = {
            itemId: item.id || item.partNumber,
            originalValue: item[field],
            correctedValue,
            field,
            reasoning,
        };

        await onSubmit(feedback);
        setIsSubmitting(false);
        onClose();

        // Reset form
        setCorrectedValue('');
        setReasoning('');
    };

    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Provide Feedback
                    </DialogTitle>
                    <DialogDescription>
                        Help BOMForge AI learn by correcting the manufacturing data for <strong>{item.partNumber}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Which field is incorrect?</Label>
                        <select
                            value={field}
                            onChange={(e) => setField(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="workCenter">Work Center</option>
                            <option value="description">Description</option>
                            <option value="quantity">Quantity</option>
                            <option value="materialSpec">Material Specification</option>
                            <option value="changeType">Change Type</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Original Value</Label>
                        <div className="p-2 bg-slate-50 rounded border text-sm text-slate-600 italic">
                            {String(item[field] || 'None')}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="correction">Corrected Value</Label>
                        <textarea
                            id="correction"
                            placeholder="Enter the correct value..."
                            value={correctedValue}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCorrectedValue(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reasoning">Why is this change needed?</Label>
                        <textarea
                            id="reasoning"
                            placeholder="e.g., This part uses a new welding cell in WC-05..."
                            value={reasoning}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReasoning(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!correctedValue || isSubmitting}
                        className="bg-teal-600 hover:bg-teal-700"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
