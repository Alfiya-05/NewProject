'use client';
import { useAuthStore } from '@/store/authStore';
import { useCases } from '@/hooks/useCase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FIRUploader } from '@/components/fir/FIRUploader';
import { CaseSummaryCard } from '@/components/case/CaseSummaryCard';
import { FileText, Upload, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Case } from '@/types';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const { cases, loading, refetch } = useCases();
  const [showUploader, setShowUploader] = useState(false);
  const [latestCase, setLatestCase] = useState<Case | null>(null);

  const activeCase = latestCase ?? cases[0] ?? null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight drop-shadow-sm">
          Namaste, {user?.profile.name}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-saffron inline-block"></span>
          Citizen Portal · {user?.systemUid}
        </p>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'File New FIR', icon: Upload, action: () => setShowUploader(true), color: 'bg-navy hover:bg-navy/90 border-navy/20' },
          { label: 'My Cases', icon: FileText, href: '/dashboard/user/case', color: 'bg-gov-green hover:bg-gov-green/90 border-gov-green/20' },
          { label: 'Hire Lawyer', icon: Users, href: '/dashboard/user/hire', color: 'bg-saffron hover:bg-saffron/90 border-saffron/20' },
          { label: 'AI Support', icon: MessageSquare, href: '/dashboard/user/support', color: 'bg-red-700 hover:bg-red-700/90 border-red-700/20' },
        ].map(({ label, icon: Icon, href, action, color }) => {
          const card = (
            <div
              className={`${color} text-white rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group border`}
              onClick={action}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <Icon className="h-16 w-16" />
              </div>
              <Icon className="h-8 w-8 mb-3 opacity-90 relative z-10" />
              <p className="font-bold tracking-wide relative z-10">{label}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>{card}</Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      {/* FIR Upload */}
      {showUploader && (
        <Card className="glass-card animate-in slide-in-from-top-4">
          <CardHeader className="bg-white/40 border-b border-navy/5">
            <CardTitle className="text-navy flex items-center gap-2">
              <Upload className="h-5 w-5 text-saffron" />
              Upload FIR Document
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <FIRUploader
              onSuccess={(newCase) => {
                setLatestCase(newCase);
                setShowUploader(false);
                refetch();
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Case overview */}
      {loading ? (
        <CaseSummaryCard caseData={null} loading />
      ) : activeCase ? (
        <div className="glass-card p-1">
          <CaseSummaryCard caseData={activeCase} />
        </div>
      ) : !showUploader ? (
        <Card className="glass-card border-dashed border-2 border-navy/20 bg-white/30 hover:bg-white/40 transition-colors cursor-pointer">
          <CardContent className="py-16 text-center" onClick={() => setShowUploader(true)}>
            <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm border border-navy/10">
              <FileText className="h-8 w-8 text-navy/40 mx-auto" />
            </div>
            <p className="text-lg font-bold text-navy tracking-tight">No cases filed yet</p>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Click &quot;File New FIR&quot; above to securely upload your document
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats */}
      {cases.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Total Cases', value: cases.length, color: 'text-navy' },
            { label: 'Active', value: cases.filter((c) => c.status === 'active').length, color: 'text-gov-green' },
            { label: 'Pending', value: cases.filter((c) => c.status === 'pending').length, color: 'text-saffron-dark' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="glass-card hover:translate-y-[-2px]">
              <CardContent className="py-6 text-center">
                <p className={`text-4xl font-extrabold pb-1 ${color} drop-shadow-sm`}>{value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
