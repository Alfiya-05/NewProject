'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Case } from '@/types';

export function useCase(caseId: string | null) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;

    setLoading(true);
    api
      .get(`/cases/${caseId}`)
      .then((res) => setCaseData(res.data.case))
      .catch(() => setError('Failed to load case'))
      .finally(() => setLoading(false));
  }, [caseId]);

  return { caseData, loading, error };
}

export function useCases(status?: string) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    api
      .get('/cases', { params: status ? { status } : {} })
      .then((res) => setCases(res.data.cases))
      .catch(() => setError('Failed to load cases'))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { refetch(); }, [refetch]);

  return { cases, loading, error, refetch };
}

