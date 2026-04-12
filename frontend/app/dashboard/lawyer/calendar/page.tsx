'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { HearingCalendar } from '@/components/calendar/HearingCalendar';
import { Hearing } from '@/types';

export default function LawyerCalendarPage() {
  const { user } = useAuthStore();
  const [hearings, setHearings] = useState<Hearing[]>([]);

  useEffect(() => {
    if (!user) return;
    // Lawyer sees hearings for their cases
    api.get('/cases')
      .then(async (r) => {
        const caseIds: string[] = r.data.cases.map((c: { _id: string }) => c._id);
        const all: Hearing[] = [];
        await Promise.all(
          caseIds.map((id) =>
            api.get(`/hearings/case/${id}`).then((hr) => all.push(...hr.data.hearings))
          )
        );
        setHearings(all);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B3A6B]">Hearing Calendar</h1>
      <p className="text-sm text-[#555]">All scheduled hearings for your cases.</p>
      <HearingCalendar hearings={hearings} editable={false} />
    </div>
  );
}
