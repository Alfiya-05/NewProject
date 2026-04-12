'use client';
import { useAuthStore } from '@/store/authStore';
import { useCases } from '@/hooks/useCase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Gavel, Clock, User, Briefcase, CalendarDays, AlertTriangle, Scale, MapPin } from 'lucide-react';

// ─── Realistic mock pending cases ──────────────────────────────────────────
const MOCK_PENDING_CASES = [
  {
    id: 'mock-1',
    caseNumber: 'MH-2024-00481',
    citizen: 'Ramesh Subramaniam',
    lawyer: 'Adv. Meher Karmakar',
    offence: 'Alleged assault and grievous hurt under IPC Section 320 & 323. Complainant sustained injuries at a road altercation near Dadar flyover.',
    ipcSections: ['IPC 320', 'IPC 323', 'IPC 34'],
    location: 'Dadar, Mumbai',
    filedDate: '14 Jan 2024',
    lastHearing: '02 Mar 2024',
    nextHearing: '18 Apr 2024',
    pendingDays: 92,
    priority: 'high' as const,
  },
  {
    id: 'mock-2',
    caseNumber: 'MH-2024-00539',
    citizen: 'Priya Nath Sharma',
    lawyer: 'Adv. Rohan Desai',
    offence: 'Domestic violence complaint under Protection of Women from Domestic Violence Act 2005. Respondent alleged to have caused mental and physical abuse.',
    ipcSections: ['DV Act 2005', 'IPC 498A'],
    location: 'Andheri East, Mumbai',
    filedDate: '28 Jan 2024',
    lastHearing: '20 Mar 2024',
    nextHearing: '25 Apr 2024',
    pendingDays: 78,
    priority: 'high' as const,
  },
  {
    id: 'mock-3',
    caseNumber: 'MH-2023-00914',
    citizen: 'Kiran Devraj Pillai',
    lawyer: 'Adv. Sneha Joshi',
    offence: 'Cheque dishonour case under Negotiable Instruments Act Section 138. Accused issued a cheque of ₹4,80,000 that bounced due to insufficient funds.',
    ipcSections: ['NI Act 138', 'IPC 420'],
    location: 'Bandra, Mumbai',
    filedDate: '09 Nov 2023',
    lastHearing: '15 Feb 2024',
    nextHearing: '30 Apr 2024',
    pendingDays: 154,
    priority: 'critical' as const,
  },
  {
    id: 'mock-4',
    caseNumber: 'MH-2024-00602',
    citizen: 'Manoj Kulkarni',
    lawyer: 'Adv. Farida Sheikh',
    offence: 'Property encroachment and unlawful dispossession. Respondent allegedly constructed boundary wall on disputed plot in violation of local zoning bylaws.',
    ipcSections: ['IPC 447', 'IPC 441'],
    location: 'Thane West',
    filedDate: '05 Feb 2024',
    lastHearing: '28 Mar 2024',
    nextHearing: '22 Apr 2024',
    pendingDays: 64,
    priority: 'medium' as const,
  },
];

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500' },
  high:     { label: 'High',     bg: 'bg-saffron/10', text: 'text-saffron-dark', border: 'border-saffron/30', bar: 'bg-saffron' },
  medium:   { label: 'Medium',   bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-400' },
};

export default function JudgeDashboard() {
  const { user } = useAuthStore();
  const { cases, loading } = useCases();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-navy border-t-saffron rounded-full animate-spin" />
    </div>
  );

  const active = cases?.filter((c) => c.status === 'active')?.length || 0;
  const pending = cases?.filter((c) => c.status === 'pending')?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-navy drop-shadow-sm">
          Honourable {user?.profile?.name || 'Justice'}
        </h1>
        <p className="text-sm text-navy/40 font-bold uppercase tracking-widest mt-1 italic">
          Judicial Dashboard · {user?.systemUid || 'SECURE-AUTH'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Cases', value: (cases?.length || 0) + MOCK_PENDING_CASES.length, href: '/dashboard/judge/active' },
          { label: 'Active Cases', value: active, href: '/dashboard/judge/active' },
          { label: 'Pending Review', value: pending + MOCK_PENDING_CASES.length, href: '/dashboard/judge/pending' },
          { label: "Today's Hearings", value: '2', href: '/dashboard/judge/calendar' },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href}>
            <Card className="glass-card hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1">
              <CardContent className="py-6 text-center">
                <p className="text-4xl font-extrabold text-navy tracking-tighter group-hover:text-saffron transition-colors">{value}</p>
                <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em] mt-2">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Live Docket from real data */}
      {(cases || []).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-navy/30 uppercase tracking-[0.3em] font-sans ml-1">Live Docket</h3>
          {cases.slice(0, 3).map((c) => (
            <Card key={c._id} className="glass-card hover:bg-white/60 transition-colors border-white/40 ring-1 ring-navy/5 border-l-4 border-l-gov-green">
              <CardContent className="py-4 px-6 flex justify-between items-center">
                <div>
                  <p className="font-heading font-extrabold text-navy text-sm tracking-wide">{c.caseNumber}</p>
                  <p className="text-xs text-navy/50 mt-1 font-medium line-clamp-1 italic">
                    {c.parsedData?.offenceDescription || 'Case description pending AI analysis...'}
                  </p>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm",
                  c.status === 'active' ? 'bg-green-100 text-gov-green border border-green-200' :
                  'bg-saffron/10 text-saffron-dark border border-saffron/20'
                )}>
                  {c.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mock Pending Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-navy/30 uppercase tracking-[0.3em] font-sans ml-1">Pending Cases — Awaiting Hearing</h3>
          <span className="text-[10px] font-extrabold text-saffron-dark uppercase tracking-widest bg-saffron/10 px-3 py-1 rounded-full border border-saffron/20">
            {MOCK_PENDING_CASES.length} Matters Listed
          </span>
        </div>

        <div className="grid gap-4">
          {MOCK_PENDING_CASES.map((c) => {
            const priority = PRIORITY_CONFIG[c.priority];
            return (
              <Card key={c.id} className={cn(
                'glass-card hover:shadow-xl transition-all hover:-translate-y-0.5 border-l-4 overflow-hidden',
                c.priority === 'critical' ? 'border-l-red-500' :
                c.priority === 'high' ? 'border-l-saffron' : 'border-l-blue-400'
              )}>
                <CardContent className="p-0">
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-navy/5">
                    <div className="flex items-center gap-3">
                      <Gavel className="h-4 w-4 text-navy/40 shrink-0" />
                      <span className="font-heading font-extrabold text-navy text-sm">{c.caseNumber}</span>
                      {c.pendingDays > 120 && (
                        <span className="flex items-center gap-1 text-[9px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase">
                          <AlertTriangle className="h-2.5 w-2.5" /> Delayed
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      'px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border',
                      priority.bg, priority.text, priority.border
                    )}>
                      {priority.label}
                    </span>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    {/* Offence description */}
                    <p className="text-xs text-navy/70 italic leading-relaxed line-clamp-2">{c.offence}</p>

                    {/* IPC Sections */}
                    <div className="flex flex-wrap gap-1">
                      {c.ipcSections.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-navy/5 border border-navy/10 text-navy/60 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-[9px] font-extrabold text-navy/30 uppercase tracking-widest mb-0.5">Complainant</p>
                        <p className="font-semibold text-navy flex items-center gap-1">
                          <User className="h-3 w-3 text-navy/30" />{c.citizen}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold text-navy/30 uppercase tracking-widest mb-0.5">Advocate</p>
                        <p className="font-semibold text-navy flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-navy/30" />{c.lawyer}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold text-navy/30 uppercase tracking-widest mb-0.5">Location</p>
                        <p className="font-semibold text-navy flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-navy/30" />{c.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold text-navy/30 uppercase tracking-widest mb-0.5">Next Hearing</p>
                        <p className="font-semibold text-navy flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-navy/30" />{c.nextHearing}
                        </p>
                      </div>
                    </div>

                    {/* Pending days bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-extrabold text-navy/30 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> Pending Duration
                        </p>
                        <p className={cn(
                          "text-[10px] font-extrabold",
                          c.pendingDays > 120 ? 'text-red-600' : c.pendingDays > 60 ? 'text-saffron-dark' : 'text-navy/60'
                        )}>
                          {c.pendingDays} days
                        </p>
                      </div>
                      <div className="h-1.5 w-full bg-navy/5 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', priority.bar)}
                          style={{ width: `${Math.min((c.pendingDays / 180) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
