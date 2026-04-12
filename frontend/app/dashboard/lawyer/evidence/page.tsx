'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useCases } from '@/hooks/useCase';
import { EvidenceItem } from '@/components/evidence/EvidenceItem';
import { EvidenceUploader } from '@/components/evidence/EvidenceUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Evidence } from '@/types';
import { Shield } from 'lucide-react';

export default function LawyerEvidencePage() {
  const { cases } = useCases();
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);

  const caseId = selectedCaseId || cases[0]?._id || '';

  const fetchEvidence = () => {
    if (!caseId) return;
    setLoading(true);
    api.get(`/evidence/${caseId}`)
      .then((r) => setEvidence(r.data.evidence))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvidence(); }, [caseId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1B3A6B]">Evidence Vault</h1>
        {cases.length > 1 && (
          <Select value={caseId} onValueChange={(v) => v && setSelectedCaseId(v)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select case" />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.caseNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <Shield className="h-4 w-4 inline mr-1" />
        Evidence files are locked <strong>15 minutes</strong> after upload and cannot be deleted thereafter.
        This ensures chain-of-custody integrity.
      </div>

      {caseId && (
        <Card className="border-[#D9D5C7]">
          <CardHeader>
            <CardTitle className="text-[#1B3A6B] text-base">Upload New Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <EvidenceUploader caseId={caseId} onUploaded={fetchEvidence} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-[#888] text-sm">Loading evidence...</p>
        ) : evidence.length === 0 ? (
          <p className="text-center text-[#888] py-8">No evidence uploaded yet.</p>
        ) : (
          evidence.map((e) => (
            <EvidenceItem
              key={e._id}
              evidence={e}
              canDelete={true}
              onDeleted={fetchEvidence}
            />
          ))
        )}
      </div>
    </div>
  );
}
