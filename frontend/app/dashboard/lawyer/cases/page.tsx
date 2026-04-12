'use client';
import { useCases } from '@/hooks/useCase';
import { CaseSummaryCard } from '@/components/case/CaseSummaryCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LawyerCasesPage() {
  const { cases, loading } = useCases();

  const active = cases.filter((c) => c.status === 'active');
  const pending = cases.filter((c) => c.status === 'pending');
  const closed = cases.filter((c) => ['closed', 'resolved'].includes(c.status));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B3A6B]">My Cases</h1>

      <Tabs defaultValue="active">
        <TabsList className="bg-[#F4F3EE] border border-[#D9D5C7]">
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
        </TabsList>

        {['active', 'pending', 'closed'].map((tab) => {
          const tabCases = tab === 'active' ? active : tab === 'pending' ? pending : closed;
          return (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
              {loading ? (
                <CaseSummaryCard caseData={null} loading />
              ) : tabCases.length === 0 ? (
                <p className="text-center text-[#888] py-8">No {tab} cases.</p>
              ) : (
                tabCases.map((c) => <CaseSummaryCard key={c._id} caseData={c} />)
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
