'use client';
import { useState } from 'react';
import { useCases } from '@/hooks/useCase';
import { api } from '@/lib/api';
import { IPCSectionsPanel } from '@/components/case/IPCSectionsPanel';
import { PunishmentWidget } from '@/components/case/PunishmentWidget';
import { SimilarCasesCarousel } from '@/components/case/SimilarCasesCarousel';
import { AIChatBox } from '@/components/chat/AIChatBox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BarChart2 } from 'lucide-react';
import { Case } from '@/types';

export default function JudgeAnalysisPage() {
  const { cases } = useCases();
  const [selectedId, setSelectedId] = useState('');
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  const selectedCase = cases.find((c) => c._id === selectedId) ?? cases[0] ?? null;

  const runAgent = async (endpoint: string) => {
    const caseId = selectedCase?._id;
    if (!caseId) return;
    setRunning(endpoint);
    try {
      await api.post(`/ai/${endpoint}`, { caseId });
      // Refresh case data
      const res = await api.get(`/cases/${caseId}`);
      setCaseData(res.data.case);
    } finally {
      setRunning(null);
    }
  };

  const displayCase = caseData ?? selectedCase;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">AI Case Analysis</h1>
          <p className="text-sm text-[#555] mt-1">Run AI agents to analyse cases</p>
        </div>
        <Select value={selectedId || selectedCase?._id} onValueChange={(v) => v && setSelectedId(v)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select case" />
          </SelectTrigger>
          <SelectContent>
            {cases.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.caseNumber}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* AI agent triggers */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Summarise Case', endpoint: 'summarise' },
          { label: 'Detect IPC Sections', endpoint: 'detect-ipc' },
          { label: 'Predict Punishment', endpoint: 'predict-punishment' },
          { label: 'Predict Timeline', endpoint: 'predict-timeline' },
          { label: 'Similar Cases', endpoint: 'similar-cases' },
        ].map(({ label, endpoint }) => (
          <Button
            key={endpoint}
            variant="outline"
            size="sm"
            onClick={() => runAgent(endpoint)}
            disabled={!!running || !displayCase}
            className="border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white"
          >
            {running === endpoint ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Running...</>
            ) : (
              <><BarChart2 className="h-3.5 w-3.5 mr-1" />{label}</>
            )}
          </Button>
        ))}
      </div>

      {displayCase && (
        <Tabs defaultValue="ipc">
          <TabsList>
            <TabsTrigger value="ipc">IPC Sections</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="precedents">Precedents</TabsTrigger>
            <TabsTrigger value="chat">AI Research Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="ipc" className="mt-4">
            <IPCSectionsPanel sections={displayCase.ipcSections} />
          </TabsContent>
          <TabsContent value="predictions" className="mt-4">
            <PunishmentWidget
              punishmentPrediction={displayCase.punishmentPrediction}
              timelinePrediction={displayCase.timelinePrediction}
            />
          </TabsContent>
          <TabsContent value="precedents" className="mt-4">
            <SimilarCasesCarousel cases={displayCase.similarCases} />
          </TabsContent>
          <TabsContent value="chat" className="mt-4">
            <AIChatBox caseId={displayCase._id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
