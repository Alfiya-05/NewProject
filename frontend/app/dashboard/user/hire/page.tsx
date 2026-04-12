'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useCases } from '@/hooks/useCase';
import { LawyerCard } from '@/components/lawyer/LawyerCard';
import { LawyerProfile } from '@/types';
import { Search, Scale, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const SPECIALISATION_FILTERS = [
  'All', 'Criminal Law', 'Corporate Law', 'Family Law',
  'Property Law', 'Labour Law', 'Tax Law', 'Constitutional Law'
];

export default function HireLawyerPage() {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { cases, refetch } = useCases();

  // Only truly unassigned cases (no lawyer yet) + cases pending this lawyer
  const unassignedCases = cases.filter(c => c.status === 'unassigned' || !c.lawyerId);

  useEffect(() => {
    api.get('/lawyers')
      .then((r) => setLawyers(r.data.lawyers))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = lawyers.filter((l) => {
    const matchesSearch =
      !search ||
      (typeof l.userId === 'object' && l.userId.profile.name.toLowerCase().includes(search.toLowerCase())) ||
      l.specialisations.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      l.post?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === 'All' ||
      l.specialisations.some((s) => s.toLowerCase().includes(activeFilter.toLowerCase()));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-navy drop-shadow-sm">Hire an Advocate</h1>
          <p className="text-sm text-navy/40 font-bold uppercase tracking-widest mt-1 italic">
            Browse verified advocates across India
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl">
          <Scale className="h-4 w-4 text-saffron" />
          <span className="text-xs font-bold text-navy uppercase tracking-wider">
            {filtered.length} Advocates
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/30 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, specialisation, or court..."
          className="w-full pl-11 pr-4 py-3.5 glass-panel border border-white/60 rounded-2xl text-sm font-medium text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/20 transition-all"
        />
      </div>

      {/* Specialisation Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <SlidersHorizontal className="h-4 w-4 text-navy/30 shrink-0" />
        {SPECIALISATION_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border',
              activeFilter === f
                ? 'bg-navy text-white border-navy shadow-lg shadow-navy/20'
                : 'bg-white/60 text-navy/60 border-navy/10 hover:border-navy/30 hover:text-navy'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* No cases warning */}
      {cases.length === 0 && !loading && (
        <div className="glass-card px-6 py-4 border-saffron/20 bg-saffron/5 flex items-center gap-3 rounded-2xl">
          <Scale className="h-5 w-5 text-saffron shrink-0" />
          <p className="text-sm text-saffron-dark font-semibold">
          You need an active case to send a request. File a case first from the &ldquo;My Case&rdquo; section.
          </p>
        </div>
      )}

      {/* Lawyer Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="flex gap-3">
                <div className="h-12 w-12 bg-navy/10 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-navy/10 rounded-full w-3/4" />
                  <div className="h-3 bg-navy/5 rounded-full w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(j => <div key={j} className="h-14 bg-navy/5 rounded-xl" />)}
              </div>
              <div className="h-10 bg-navy/10 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed border-navy/10">
          <Scale className="h-10 w-10 text-navy/20 mx-auto mb-4" />
          <p className="text-navy/40 font-bold uppercase tracking-widest text-xs">
            No advocates found matching your search
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((l) => (
            <LawyerCard key={l._id} lawyer={l} availableCases={unassignedCases} onRequestSent={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
