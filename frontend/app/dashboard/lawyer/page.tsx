'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCases } from '@/hooks/useCase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, CalendarCheck, CheckCircle2, XCircle, Loader2, MapPin, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export default function LawyerDashboard() {
  const { user } = useAuthStore();
  const { cases, loading, refetch } = useCases();
  const [responding, setResponding] = useState<string | null>(null);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-navy border-t-saffron rounded-full animate-spin" />
    </div>
  );

  const activeCases = cases?.filter((c) => c.status === 'active') || [];
  const pendingRequests = cases?.filter((c) => c.status === 'unassigned') || [];

  const handleRespond = async (caseId: string, action: 'accept' | 'decline') => {
    setResponding(caseId);
    try {
      await api.post(`/lawyers/request/${caseId}/respond`, { action });
      await refetch();
    } catch (e) {
      console.error('Respond failed', e);
    } finally {
      setResponding(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-navy drop-shadow-sm">
            Welcome, Adv. {user?.profile?.name || 'Counsel'}
          </h1>
          <p className="text-sm text-navy/40 font-bold uppercase tracking-widest mt-1 italic">
            {user?.systemUid || 'BAR-VERIFIED'} · Professional Portal
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Matters', value: cases?.length || 0, href: '/dashboard/lawyer/cases' },
          { label: 'Active Litigation', value: activeCases.length, href: '/dashboard/lawyer/cases' },
          { label: 'Pending Filing', value: cases?.filter(c => c.status === 'pending').length || 0, href: '/dashboard/lawyer/cases' },
          { label: 'New Requests', value: pendingRequests.length, href: '#requests' },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href}>
            <Card className="glass-card hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1">
              <CardContent className="py-6 text-center">
                <p className={cn(
                  "text-4xl font-extrabold tracking-tighter group-hover:text-saffron transition-colors",
                  label === 'New Requests' && pendingRequests.length > 0 ? 'text-saffron' : 'text-navy'
                )}>{value}</p>
                <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em] mt-2">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Incoming Case Requests */}
      {pendingRequests.length > 0 && (
        <div id="requests" className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-navy/30 uppercase tracking-[0.3em] font-sans ml-1">Incoming Case Requests</h3>
            <span className="px-2 py-0.5 bg-saffron text-white rounded-full text-[9px] font-extrabold uppercase">{pendingRequests.length} New</span>
          </div>
          <div className="grid gap-4">
            {pendingRequests.map((c) => {
              const citizen = typeof c.citizenId === 'object' ? c.citizenId : null;
              return (
                <Card key={c._id} className="glass-card border-l-4 border-l-saffron hover:shadow-lg transition-all animate-in fade-in">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Case Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-saffron shrink-0" />
                          <span className="font-extrabold text-navy font-heading">{c.caseNumber}</span>
                          <span className="px-2 py-0.5 bg-saffron/10 text-saffron-dark rounded-full text-[9px] font-extrabold uppercase tracking-widest">Awaiting Review</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mt-2">
                          {citizen && (
                            <div>
                              <p className="text-navy/40 font-bold uppercase tracking-widest text-[10px]">Citizen</p>
                              <p className="font-semibold text-navy">{(citizen as any).profile?.name}</p>
                            </div>
                          )}
                          {c.parsedData?.date && (
                            <div>
                              <p className="text-navy/40 font-bold uppercase tracking-widest text-[10px]">Incident Date</p>
                              <p className="font-semibold text-navy">{c.parsedData.date}</p>
                            </div>
                          )}
                          {c.parsedData?.location && (
                            <div>
                              <p className="text-navy/40 font-bold uppercase tracking-widest text-[10px]">Location</p>
                              <p className="font-semibold text-navy flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-navy/40" />{c.parsedData.location}
                              </p>
                            </div>
                          )}
                        </div>

                        {c.parsedData?.offenceDescription && (
                          <div className="bg-navy/5 rounded-lg p-3 border border-navy/5 mt-2">
                            <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest mb-1">Case Summary</p>
                            <p className="text-xs text-navy/70 italic leading-relaxed line-clamp-3">{c.parsedData.offenceDescription}</p>
                          </div>
                        )}

                        {c.ipcSections && c.ipcSections.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.ipcSections.slice(0, 4).map((s: any) => (
                              <span key={s.section} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-[9px] font-bold uppercase">{s.section}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-gov-green hover:bg-gov-green/90 text-white font-bold"
                          onClick={() => handleRespond(c._id, 'accept')}
                          disabled={responding === c._id}
                        >
                          {responding === c._id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <><CheckCircle2 className="h-4 w-4 mr-1" /> Accept</>
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleRespond(c._id, 'decline')}
                          disabled={responding === c._id}
                        >
                          {responding === c._id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <><XCircle className="h-4 w-4 mr-1" /> Decline</>
                          }
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Cases + Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-navy/30 uppercase tracking-[0.3em] font-sans ml-1">Active Matters</h3>
          {activeCases.length > 0 ? (
            activeCases.slice(0, 4).map((c) => (
              <Card key={c._id} className="glass-card hover:bg-white/60 transition-colors border-white/40 ring-1 ring-navy/5">
                <CardContent className="py-4 px-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-heading font-extrabold text-navy text-sm tracking-wide">{c.caseNumber}</p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-100 text-gov-green">Active</span>
                  </div>
                  <p className="text-xs text-navy/50 font-medium line-clamp-2 italic leading-relaxed">
                    {c.parsedData?.offenceDescription || 'Document analysis in progress...'}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="glass-card p-12 text-center border-dashed border-navy/10">
              <p className="text-navy/40 font-bold uppercase tracking-widest text-xs">No active matters yet</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-navy/30 uppercase tracking-[0.3em] font-sans ml-1">Upcoming Deadlines</h3>
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center opacity-60 grayscale">
            <Calendar className="h-8 w-8 text-navy/20 mb-4" />
            <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">Integrating with Judicial Calendar...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
