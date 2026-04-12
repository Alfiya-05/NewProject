'use client';
import { useCases } from '@/hooks/useCase';
import { CaseSummaryCard } from '@/components/case/CaseSummaryCard';

export default function JudgeActiveCasesPage() {
  const { cases, loading } = useCases('active');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B3A6B]">Active Cases</h1>
      {loading ? (
        <CaseSummaryCard caseData={null} loading />
      ) : cases.length === 0 ? (
        <p className="text-center text-[#888] py-12">No active cases assigned to you.</p>
      ) : (
        cases.map((c) => <CaseSummaryCard key={c._id} caseData={c} />)
      )}
    </div>
  );
}
