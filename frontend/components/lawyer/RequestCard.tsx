'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface RequestCardProps {
  caseId: string;
  caseNumber: string;
  citizenName: string;
  offenceDescription: string;
  onRespond?: () => void;
}

export function RequestCard({ caseId, caseNumber, citizenName, offenceDescription, onRespond }: RequestCardProps) {
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);
  const [responded, setResponded] = useState(false);

  const respond = async (action: 'accept' | 'decline') => {
    setLoading(action);
    try {
      await api.post(`/lawyers/request/${caseId}/respond`, { action });
      setResponded(true);
      onRespond?.();
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-[#D9D5C7]">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <p className="font-semibold text-[#1B3A6B]">Case {caseNumber}</p>
          {responded && <span className="badge-active">Responded</span>}
        </div>
        <p className="text-sm text-[#555] mb-1">From: <strong>{citizenName}</strong></p>
        <p className="text-sm text-[#1A1A1A] line-clamp-2 mb-3">{offenceDescription}</p>

        {!responded && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-[#2D6A4F] hover:bg-[#246040] text-white"
              onClick={() => respond('accept')}
              disabled={!!loading}
            >
              {loading === 'accept' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                <><CheckCircle className="h-3.5 w-3.5 mr-1" />Accept</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => respond('decline')}
              disabled={!!loading}
            >
              {loading === 'decline' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                <><XCircle className="h-3.5 w-3.5 mr-1" />Decline</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
