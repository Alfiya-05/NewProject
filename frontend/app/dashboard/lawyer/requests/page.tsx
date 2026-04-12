'use client';
import { useCases } from '@/hooks/useCase';
import { RequestCard } from '@/components/lawyer/RequestCard';
import { Inbox } from 'lucide-react';

export default function LawyerRequestsPage() {
  const { cases, loading, refetch } = useCases('unassigned');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B3A6B]">Incoming Case Requests</h1>

      {loading ? (
        <p className="text-[#888] text-sm">Loading requests...</p>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 text-[#888]">
          <Inbox className="h-12 w-12 mx-auto mb-3" />
          <p className="font-medium">No pending case requests</p>
          <p className="text-sm mt-1">Citizens will send requests here when they want to hire you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <RequestCard
              key={c._id}
              caseId={c._id}
              caseNumber={c.caseNumber}
              citizenName={
                typeof c.citizenId === 'object' ? c.citizenId.profile.name : 'Unknown'
              }
              offenceDescription={c.parsedData.offenceDescription}
              onRespond={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
