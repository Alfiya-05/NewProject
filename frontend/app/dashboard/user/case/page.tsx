'use client';
import { useCases } from '@/hooks/useCase';
import { CaseSummaryCard } from '@/components/case/CaseSummaryCard';
import { IPCSectionsPanel } from '@/components/case/IPCSectionsPanel';
import { PunishmentWidget } from '@/components/case/PunishmentWidget';
import { SimilarCasesCarousel } from '@/components/case/SimilarCasesCarousel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function UserCasePage() {
  const { cases, loading } = useCases();
  const [selectedId, setSelectedId] = useState<string>('');

  const caseData = cases.find((c) => c._id === selectedId) ?? cases[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1B3A6B]">My Cases</h1>
        {cases.length > 1 && (
          <Select value={selectedId || caseData?._id} onValueChange={(v) => v && setSelectedId(v)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a case" />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.caseNumber} ({c.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <CaseSummaryCard caseData={caseData} loading={loading} />

      {caseData && (
        <>
          <IPCSectionsPanel sections={caseData.ipcSections} />
          <PunishmentWidget
            punishmentPrediction={caseData.punishmentPrediction}
            timelinePrediction={caseData.timelinePrediction}
          />
          <SimilarCasesCarousel cases={caseData.similarCases} />
        </>
      )}
    </div>
  );
}
