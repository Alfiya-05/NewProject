import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertCircle, UserCheck, Gavel } from 'lucide-react';
import { Case } from '@/types';

const STATUS_BADGES: Record<string, string> = {
  active: 'badge-active',
  pending: 'badge-pending',
  unassigned: 'badge-pending',
  closed: 'badge-immutable',
  resolved: 'badge-immutable',
  draft: 'badge-immutable',
};

interface CaseSummaryCardProps {
  caseData: Case | null;
  loading?: boolean;
}

export function CaseSummaryCard({ caseData, loading }: CaseSummaryCardProps) {
  if (loading) {
    return (
      <Card className="border-[#D9D5C7]">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!caseData) return null;

  return (
    <Card className="border-[#D9D5C7] bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#1B3A6B]">
            <FileText className="h-5 w-5" />
            Case {caseData.caseNumber}
          </CardTitle>
          <span className={STATUS_BADGES[caseData.status] ?? 'badge-pending'}>
            {caseData.status.toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#888] text-xs uppercase tracking-wide">Parties</p>
            <p className="font-medium text-[#1A1A1A]">
              {caseData.parsedData.parties.join(' vs ')}
            </p>
          </div>
          <div>
            <p className="text-[#888] text-xs uppercase tracking-wide">Incident Date</p>
            <p className="font-medium text-[#1A1A1A]">{caseData.parsedData.date}</p>
          </div>
          <div>
            <p className="text-[#888] text-xs uppercase tracking-wide">Location</p>
            <p className="font-medium text-[#1A1A1A]">{caseData.parsedData.location}</p>
          </div>
          {caseData.parsedData.policeStation && (
            <div>
              <p className="text-[#888] text-xs uppercase tracking-wide">Police Station</p>
              <p className="font-medium text-[#1A1A1A]">{caseData.parsedData.policeStation}</p>
            </div>
          )}
        </div>

        {/* Assigned Lawyer Banner */}
        {caseData.status === 'active' && caseData.lawyerId && (
          <div className="flex items-center gap-2 bg-gov-green/10 border border-gov-green/30 rounded-lg px-4 py-2.5">
            <UserCheck className="h-4 w-4 text-gov-green shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-gov-green uppercase tracking-widest">Assigned Advocate</p>
              <p className="text-sm font-bold text-navy">
                {typeof caseData.lawyerId === 'object' && 'profile' in caseData.lawyerId
                  ? (caseData.lawyerId as any).profile?.name
                  : 'Advocate Confirmed'}
              </p>
            </div>
          </div>
        )}

        {caseData.aiSummary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
              {caseData.aiSummary}
            </p>
          </div>
        )}

        {/* Assigned Judge Banner */}
        {caseData.judgeId && (
          <div className="flex items-center gap-2 bg-navy/5 border border-navy/15 rounded-lg px-4 py-2.5">
            <Gavel className="h-4 w-4 text-navy/50 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">Presiding Judge</p>
              <p className="text-sm font-bold text-navy">
                {typeof caseData.judgeId === 'object' && 'profile' in caseData.judgeId
                  ? `Hon. ${(caseData.judgeId as any).profile?.name}`
                  : 'Judge Assigned'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-[#888] bg-[#F8F7F2] rounded p-2">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>AI-generated content is for informational purposes only and does not constitute legal advice.</span>
        </div>
      </CardContent>
    </Card>
  );
}
