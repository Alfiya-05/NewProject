'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { HearingCalendar } from '@/components/calendar/HearingCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Hearing } from '@/types';
import { useCases } from '@/hooks/useCase';
import { Clock, CalendarDays, MapPin, Gavel, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock daily schedule to populate the time section
const MOCK_DAILY_SCHEDULE = [
  { time: '10:00 AM', caseNumber: 'MH-2024-00481', parties: 'Ramesh Subramaniam vs State', type: 'Arguments', courtRoom: 'Court Room 2', duration: 45, status: 'confirmed' as const },
  { time: '11:00 AM', caseNumber: 'MH-2024-00539', parties: 'Priya Nath Sharma vs Respondent', type: 'Evidence Submission', courtRoom: 'Court Room 2', duration: 60, status: 'confirmed' as const },
  { time: '12:00 PM', caseNumber: '—', parties: '—', type: 'Recess', courtRoom: '', duration: 60, status: 'break' as const },
  { time: '01:00 PM', caseNumber: 'MH-2023-00914', parties: 'Kiran Devraj Pillai vs Accused', type: 'Judgment Reserved', courtRoom: 'Court Room 2', duration: 30, status: 'confirmed' as const },
  { time: '02:00 PM', caseNumber: 'MH-2024-00602', parties: 'Manoj Kulkarni vs Opposition', type: 'Cross Examination', courtRoom: 'Court Room 2', duration: 90, status: 'confirmed' as const },
  { time: '03:30 PM', caseNumber: '—', parties: '—', type: 'Chambers Time / File Review', courtRoom: '', duration: 30, status: 'chambers' as const },
];

const STATUS_CONFIG = {
  confirmed:  { dot: 'bg-gov-green', bar: 'border-l-gov-green bg-green-50/60', badge: 'bg-green-100 text-gov-green' },
  break:      { dot: 'bg-slate-300', bar: 'border-l-slate-300 bg-slate-50/60', badge: 'bg-slate-100 text-slate-500' },
  chambers:   { dot: 'bg-navy/30',   bar: 'border-l-navy/30 bg-navy/5',       badge: 'bg-navy/10 text-navy/50' },
};

export default function JudgeCalendarPage() {
  const { user } = useAuthStore();
  const { cases } = useCases();
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [courtRoom, setCourtRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [hearingTime, setHearingTime] = useState('10:00');
  const [hearingType, setHearingType] = useState('Arguments');
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const fetchHearings = () => {
    if (!user) return;
    api.get(`/hearings/judge/${user._id}`)
      .then((r) => setHearings(r.data.hearings))
      .catch(() => {});
  };

  useEffect(() => { fetchHearings(); }, [user]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!selectedCaseId) return;
    setSaving(true);
    try {
      const dateWithTime = `${selectedDate}T${hearingTime}:00`;
      await api.post('/hearings', {
        caseId: selectedCaseId,
        hearingDate: dateWithTime,
        courtRoom,
        notes,
      });
      setShowDialog(false);
      fetchHearings();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-navy">Judicial Calendar</h1>
          <p className="text-sm text-navy/40 font-bold uppercase tracking-widest mt-1">Click any date to schedule a hearing</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl">
          <CalendarDays className="h-4 w-4 text-saffron" />
          <span className="text-xs font-bold text-navy/60">{today}</span>
        </div>
      </div>

      {/* Calendar */}
      <HearingCalendar hearings={hearings} editable onDateClick={handleDateClick} />

      {/* ── Today's Time Schedule ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-navy/30 uppercase tracking-[0.3em] font-sans ml-1 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Today&apos;s Court Schedule
          </h3>
          <span className="text-[10px] text-navy/40 font-bold uppercase tracking-widest">
            {MOCK_DAILY_SCHEDULE.filter(s => s.status === 'confirmed').length} Hearings Listed
          </span>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[72px] top-0 bottom-0 w-px bg-navy/10" />

          <div className="space-y-2">
            {MOCK_DAILY_SCHEDULE.map((slot, i) => {
              const config = STATUS_CONFIG[slot.status];
              return (
                <div key={i} className="flex items-stretch gap-4 group">
                  {/* Time column */}
                  <div className="w-[72px] shrink-0 text-right pr-4 pt-3">
                    <p className="text-[11px] font-extrabold text-navy/50 leading-none">{slot.time}</p>
                  </div>

                  {/* Timeline dot */}
                  <div className="relative flex flex-col items-center shrink-0 pt-3.5">
                    <div className={cn('w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10', config.dot)} />
                  </div>

                  {/* Card */}
                  <div className={cn(
                    'flex-1 rounded-xl border-l-4 px-4 py-3 mb-1 transition-all',
                    config.bar,
                    slot.status === 'confirmed' && 'hover:shadow-md hover:-translate-y-0.5 cursor-default'
                  )}>
                    {slot.status === 'break' || slot.status === 'chambers' ? (
                      <p className="text-xs font-bold text-navy/40 uppercase tracking-widest">{slot.type}</p>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-extrabold text-navy text-sm">{slot.caseNumber}</span>
                            <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest', config.badge)}>
                              {slot.type}
                            </span>
                          </div>
                          <p className="text-xs text-navy/60 font-medium italic">{slot.parties}</p>
                          {slot.courtRoom && (
                            <p className="text-[10px] text-navy/40 font-bold flex items-center gap-1 uppercase tracking-wide">
                              <MapPin className="h-2.5 w-2.5" />{slot.courtRoom}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-navy/40 font-bold uppercase tracking-wider">Duration</p>
                          <p className="text-sm font-extrabold text-navy">{slot.duration} min</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 px-2 pt-2">
          {[
            { dot: 'bg-gov-green', label: 'Confirmed Hearing' },
            { dot: 'bg-navy/30', label: 'Chambers / Review' },
            { dot: 'bg-slate-300', label: 'Recess / Break' },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', dot)} />
              <p className="text-[10px] text-navy/40 font-bold uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Hearing Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-navy border-navy/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Gavel className="h-5 w-5 text-saffron" />
              Schedule Hearing — {selectedDate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Case */}
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Select Case</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full mt-1.5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 bg-white/10 text-white"
              >
                <option value="" className="bg-navy">Select a case...</option>
                {cases.map((c) => (
                  <option key={c._id} value={c._id} className="bg-navy">{c.caseNumber}</option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Time</label>
                <input
                  type="time"
                  value={hearingTime}
                  onChange={(e) => setHearingTime(e.target.value)}
                  className="w-full mt-1.5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 bg-white/10 text-white [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Hearing Type</label>
                <select
                  value={hearingType}
                  onChange={(e) => setHearingType(e.target.value)}
                  className="w-full mt-1.5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 bg-white/10 text-white"
                >
                  {['Arguments', 'Evidence Submission', 'Cross Examination', 'Judgment Reserved', 'Bail Hearing', 'Interim Order', 'Final Hearing', 'Others'].map(t => (
                    <option key={t} value={t} className="bg-navy">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Court Room */}
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Court Room</label>
              <input
                type="text"
                value={courtRoom}
                onChange={(e) => setCourtRoom(e.target.value)}
                placeholder="e.g. Court Room 3, High Court"
                className="w-full mt-1.5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 bg-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or documents required..."
                className="w-full mt-1.5 border border-white/10 rounded-xl px-3 py-2.5 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-saffron/50 bg-white/10 text-white placeholder:text-white/30"
              />
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
              <Button
                className="bg-saffron hover:bg-saffron/90 text-navy font-bold"
                onClick={handleSave}
                disabled={!selectedCaseId || saving}
              >
                {saving ? 'Scheduling...' : 'Schedule Hearing'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
