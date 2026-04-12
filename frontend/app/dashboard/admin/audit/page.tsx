'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AuditLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  EVIDENCE_DELETED: 'badge-urgent',
  EVIDENCE_UPLOADED: 'badge-active',
  USER_REGISTERED: 'badge-active',
  USER_VERIFIED: 'badge-active',
  USER_ROLE_CHANGED: 'badge-pending',
  FIR_UPLOADED: 'badge-active',
  CASE_STATUS_CHANGED: 'badge-pending',
  HEARING_CREATED: 'badge-active',
  HEARING_UPDATED: 'badge-pending',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = (p = 1) => {
    setLoading(true);
    api.get('/admin/audit', { params: { page: p, limit: 50 } })
      .then((r) => {
        setLogs(r.data.logs);
        setPages(r.data.pages);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(page); }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Audit Log</h1>
          <p className="text-sm text-[#555] mt-1">
            {total} tamper-proof entries · SHA-256 hash chain
          </p>
        </div>
        <Shield className="h-6 w-6 text-[#1B3A6B]" />
      </div>

      {loading ? (
        <p className="text-[#888]">Loading audit log...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#D9D5C7] bg-white">
          <table className="w-full text-xs">
            <thead className="bg-[#F4F3EE] border-b border-[#D9D5C7]">
              <tr>
                {['Timestamp', 'Action', 'Performed By', 'Target', 'Hash'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-[#555] font-medium uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-[#F4F3EE] hover:bg-[#F8F7F2]">
                  <td className="px-3 py-2.5 text-[#888] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={ACTION_COLORS[log.action] ?? 'badge-immutable'}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">
                      {typeof log.performedBy === 'object' ? log.performedBy.profile?.name : '—'}
                    </p>
                    <p className="text-[#888]">{log.performedByRole}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{log.targetEntity}</p>
                    <p className="text-[#aaa] font-mono text-[10px]">{log.targetId?.slice(0, 16)}...</p>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[#aaa]">
                    {log.hash?.slice(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-[#555]">Page {page} of {pages}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
