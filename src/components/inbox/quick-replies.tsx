"use client";

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Wand2 } from 'lucide-react';
import { suggestQuickReplies } from '@/ai/flows/suggest-reply';
import { Skeleton } from '../ui/skeleton';

interface QuickRepliesProps {
    latestCustomerMessage: string;
}

export function QuickReplies({ latestCustomerMessage }: QuickRepliesProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const handleSuggestReplies = () => {
        startTransition(async () => {
            const result = await suggestQuickReplies({ latestCustomerMessage });
            setSuggestions(result.quickReplies);
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Suggested Replies</h4>
                <Button onClick={handleSuggestReplies} disabled={isPending} size="sm" variant="ghost">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {isPending && (
                    <>
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-40" />
                        <Skeleton className="h-9 w-28" />
                    </>
                )}
                {!isPending && suggestions.map((reply, index) => (
                    <Button key={index} variant="outline" size="sm" className="transition-all hover:bg-accent/50">
                        {reply}
                    </Button>
                ))}
            </div>
        </div>
    );
}
