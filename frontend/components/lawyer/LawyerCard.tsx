'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Briefcase, MapPin, Loader2, Scale, IndianRupee, Award, CheckCircle2, ChevronDown, X } from 'lucide-react';
import { LawyerProfile, Case } from '@/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface LawyerCardProps {
  lawyer: LawyerProfile;
  availableCases: Case[];  // all unassigned cases the citizen can select from
  onRequestSent?: () => void;
}

export function LawyerCard({ lawyer, availableCases, onRequestSent }: LawyerCardProps) {
  const [requesting, setRequesting] = useState(false);
  const [showCasePicker, setShowCasePicker] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [sentCaseIds, setSentCaseIds] = useState<string[]>([]);

  const lawyerUser = typeof lawyer.userId === 'object' ? lawyer.userId : null;
  const lawyerUserId = lawyerUser?._id ?? '';

  // Cases already requested to THIS specific lawyer
  const alreadyRequestedToThisLawyer = availableCases.filter((c) => {
    const lid = typeof c.lawyerId === 'object' ? c.lawyerId?._id : c.lawyerId;
    return lid === lawyerUserId && c.status === 'unassigned';
  });

  // Cases that are truly free (no lawyer assigned)
  const freeCases = availableCases.filter((c) => {
    const lid = typeof c.lawyerId === 'object' ? c.lawyerId?._id : c.lawyerId;
    return !lid;
  });

  // All eligible cases to show in picker
  const eligibleCases = [...freeCases, ...alreadyRequestedToThisLawyer];

  const handleRequest = async () => {
    if (!selectedCaseId) return;
    setRequesting(true);
    try {
      await api.post('/lawyers/request', { lawyerId: lawyerUserId, caseId: selectedCaseId });
      setSentCaseIds((prev) => [...prev, selectedCaseId]);
      setShowCasePicker(false);
      setSelectedCaseId('');
      onRequestSent?.();
    } catch {
      // ignore
    } finally {
      setRequesting(false);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn('h-3 w-3', i < Math.round(rating) ? 'text-saffron fill-saffron' : 'text-navy/20 fill-navy/10')}
      />
    ));

  const hasCasesToRequest = eligibleCases.length > 0;

  return (
    <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group border-white/50">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-navy via-saffron to-gov-green opacity-60 group-hover:opacity-100 transition-opacity" />

      <CardContent className="pt-5 pb-5 px-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-navy/5 border border-navy/10 flex items-center justify-center shrink-0 group-hover:bg-saffron/10 transition-colors">
            <Scale className="h-5 w-5 text-saffron" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-heading font-extrabold text-navy text-base leading-tight truncate">
                {lawyerUser?.profile.name ?? 'Advocate'}
              </p>
              {lawyer.isBarVerified && <CheckCircle2 className="h-3.5 w-3.5 text-gov-green shrink-0" />}
            </div>
            {lawyer.post && (
              <p className="text-[11px] font-bold text-navy/50 uppercase tracking-wide mt-0.5 truncate">{lawyer.post}</p>
            )}
          </div>
          <div className={cn(
            'px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border shrink-0',
            lawyer.isAvailable ? 'bg-green-50 text-gov-green border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'
          )}>
            {lawyer.isAvailable ? 'Available' : 'Busy'}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">{renderStars(lawyer.rating)}</div>
          <span className="text-xs font-bold text-navy">{lawyer.rating.toFixed(1)}</span>
          <span className="text-[10px] text-navy/30 font-medium">({lawyer.totalCases} cases)</span>
          {lawyerUser?.profile.location && (
            <div className="flex items-center gap-1 ml-auto text-[10px] text-navy/40 font-semibold">
              <MapPin className="h-3 w-3" />
              {lawyerUser.profile.location}
            </div>
          )}
        </div>

        {/* Specialisations */}
        <div className="flex flex-wrap gap-1.5">
          {lawyer.specialisations.slice(0, 4).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-navy/5 border border-navy/10 text-navy/60 rounded-full text-[10px] font-bold uppercase tracking-wider">{s}</span>
          ))}
          {lawyer.specialisations.length > 4 && (
            <span className="px-2 py-0.5 bg-saffron/10 border border-saffron/20 text-saffron-dark rounded-full text-[10px] font-bold">+{lawyer.specialisations.length - 4} more</span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/60 rounded-xl p-2.5 border border-white/80 text-center">
            <div className="flex justify-center mb-1"><Briefcase className="h-3.5 w-3.5 text-navy/40" /></div>
            <p className="text-sm font-extrabold text-navy leading-none">{lawyer.experienceYears}+</p>
            <p className="text-[9px] text-navy/40 font-bold uppercase tracking-wider mt-0.5">Yrs Exp</p>
          </div>
          <div className="bg-white/60 rounded-xl p-2.5 border border-white/80 text-center">
            <div className="flex justify-center mb-1"><IndianRupee className="h-3.5 w-3.5 text-saffron/60" /></div>
            <p className="text-sm font-extrabold text-navy leading-none">{(lawyer.feePerHearing / 1000).toFixed(0)}K</p>
            <p className="text-[9px] text-navy/40 font-bold uppercase tracking-wider mt-0.5">/Hearing</p>
          </div>
          <div className="bg-white/60 rounded-xl p-2.5 border border-white/80 text-center">
            <div className="flex justify-center mb-1"><Award className="h-3.5 w-3.5 text-gov-green/60" /></div>
            <p className="text-sm font-extrabold text-navy leading-none">{lawyer.totalCases}</p>
            <p className="text-[9px] text-navy/40 font-bold uppercase tracking-wider mt-0.5">Cases</p>
          </div>
        </div>

        {/* Bar Number */}
        <div className="bg-navy/3 border border-navy/5 rounded-xl px-4 py-2.5 flex justify-between items-center text-xs">
          <span className="text-navy/40 font-bold uppercase tracking-widest text-[10px]">Bar No</span>
          <span className="font-mono font-bold text-navy/70">{lawyer.barNumber}</span>
        </div>

        {lawyer.retainerFee > 0 && (
          <p className="text-[10px] text-navy/40 font-semibold text-center -mt-2">
            Retainer: ₹{lawyer.retainerFee.toLocaleString('en-IN')}
          </p>
        )}

        {/* Bio */}
        {lawyer.bio && (
          <p className="text-xs text-navy/50 italic line-clamp-2 leading-relaxed border-t border-navy/5 pt-3">
            &ldquo;{lawyer.bio}&rdquo;
          </p>
        )}

        {/* CTA + Case Picker */}
        {hasCasesToRequest ? (
          <div className="space-y-2">
            {!showCasePicker ? (
              <Button
                size="sm"
                className="w-full font-bold py-5 rounded-xl bg-navy hover:bg-navy/90 text-white shadow-lg shadow-navy/20"
                onClick={() => setShowCasePicker(true)}
                disabled={!lawyer.isAvailable}
              >
                {lawyer.isAvailable ? 'Request This Advocate' : 'Advocate Unavailable'}
              </Button>
            ) : (
              <div className="bg-navy/5 border border-navy/10 rounded-xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-navy/60 uppercase tracking-widest">Select a Case to Assign</p>
                  <button onClick={() => setShowCasePicker(false)} className="text-navy/30 hover:text-navy/60">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {eligibleCases.map((c) => {
                    const alreadySent = sentCaseIds.includes(c._id);
                    const assignedToThis = (() => {
                      const lid = typeof c.lawyerId === 'object' ? c.lawyerId?._id : c.lawyerId;
                      return lid === lawyerUserId;
                    })();
                    return (
                      <button
                        key={c._id}
                        onClick={() => !alreadySent && !assignedToThis && setSelectedCaseId(c._id)}
                        className={cn(
                          'w-full text-left p-2.5 rounded-lg border text-xs transition-all',
                          alreadySent || assignedToThis
                            ? 'bg-saffron/10 border-saffron/20 text-saffron-dark cursor-not-allowed'
                            : selectedCaseId === c._id
                            ? 'bg-navy text-white border-navy'
                            : 'bg-white border-navy/10 hover:border-navy/30 text-navy/80'
                        )}
                      >
                        <span className="font-bold block">{c.caseNumber}</span>
                        <span className="text-[10px] line-clamp-1 opacity-70">
                          {alreadySent || assignedToThis ? '✓ Request Pending' : c.parsedData?.offenceDescription?.slice(0, 60) + '...'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  className="w-full bg-navy hover:bg-navy/90 text-white py-4 font-bold text-xs rounded-lg"
                  onClick={handleRequest}
                  disabled={!selectedCaseId || requesting}
                >
                  {requesting ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Sending...</> : 'Send Request to Advocate'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2 text-[11px] text-navy/40 font-bold uppercase tracking-widest">
            No unassigned cases to assign
          </div>
        )}
      </CardContent>
    </Card>
  );
}
