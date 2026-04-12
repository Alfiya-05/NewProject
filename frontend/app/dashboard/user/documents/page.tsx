'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useCases } from '@/hooks/useCase';
import { EvidenceItem } from '@/components/evidence/EvidenceItem';
import { EvidenceUploader } from '@/components/evidence/EvidenceUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Evidence } from '@/types';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  const { cases } = useCases();
  const caseId = cases[0]?._id;
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);

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
      <h1 className="text-2xl font-bold text-[#1B3A6B]">My Documents</h1>

      {caseId && (
        <Card className="border-[#D9D5C7]">
          <CardHeader>
            <CardTitle className="text-[#1B3A6B] text-base">Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <EvidenceUploader caseId={caseId} onUploaded={fetchEvidence} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-[#888] text-sm">Loading documents...</p>
        ) : evidence.length === 0 ? (
          <div className="text-center py-12 text-[#888]">
            <FileText className="h-10 w-10 mx-auto mb-2" />
            <p>No documents uploaded yet.</p>
          </div>
        ) : (
          evidence.map((e) => (
            <EvidenceItem
              key={e._id}
              evidence={e}
              canDelete={!e.isImmutable}
              onDeleted={fetchEvidence}
            />
          ))
        )}
      </div>
    </div>
  );
}
