'use client';
import { useCases } from '@/hooks/useCase';
import { CaseSummaryCard } from '@/components/case/CaseSummaryCard';
import { AlertTriangle } from 'lucide-react';

export default function JudgePendingCasesPage() {
  const { cases, loading } = useCases('pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A6B]">Pending Cases</h1>
        <div className="flex items-center gap-2 mt-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm w-fit">
          <AlertTriangle className="h-4 w-4" />
          Cases inactive for more than 3 months are automatically shifted here.
        </div>
      </div>
      {loading ? (
        <CaseSummaryCard caseData={null} loading />
      ) : cases.length === 0 ? (
        <p className="text-center text-[#888] py-12">No pending cases. All cases are active.</p>
      ) : (
        cases.map((c) => <CaseSummaryCard key={c._id} caseData={c} />)
      )}
    </div>
  );
}
