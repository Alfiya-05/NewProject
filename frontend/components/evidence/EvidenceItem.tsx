'use client';
import { useState, useEffect } from 'react';
import { File, Trash2, Lock, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Evidence } from '@/types';
import { api } from '@/lib/api';

interface EvidenceItemProps {
  evidence: Evidence;
  canDelete?: boolean;
  onDeleted?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTimeRemaining(uploadTimestamp: string): number {
  const uploadTime = new Date(uploadTimestamp).getTime();
  const lockTime = uploadTime + 15 * 60 * 1000;
  return Math.max(0, lockTime - Date.now());
}

export function EvidenceItem({ evidence, canDelete, onDeleted }: EvidenceItemProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(evidence.uploadTimestamp));
  const [isImmutable, setIsImmutable] = useState(evidence.isImmutable);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isImmutable) return;
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(evidence.uploadTimestamp);
      setTimeLeft(remaining);
      if (remaining === 0) setIsImmutable(true);
    }, 1000);
    return () => clearInterval(interval);
  }, [evidence.uploadTimestamp, isImmutable]);

  const formatCountdown = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${evidence.fileName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/evidence/${evidence._id}`);
      onDeleted?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border border-[#D9D5C7] rounded-lg bg-white">
      <File className="h-8 w-8 text-[#1B3A6B] shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-[#1A1A1A] truncate">{evidence.fileName}</p>
        <p className="text-xs text-[#888]">
          {formatFileSize(evidence.fileSizeBytes)} · {evidence.uploaderName} ·{' '}
          {new Date(evidence.uploadTimestamp).toLocaleString('en-IN')}
        </p>
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isImmutable ? (
          <span className="badge-immutable flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Immutable
          </span>
        ) : (
          <span className="badge-active text-xs">
            🔓 {formatCountdown(timeLeft)} to lock
          </span>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/evidence/${evidence._id}/file`, '_blank')}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>

        {canDelete && !isImmutable && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
