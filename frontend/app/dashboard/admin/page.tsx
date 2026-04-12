'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Users, FileText, Shield, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  usersByRole: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data.stats))
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, href: '/dashboard/admin/users', color: 'text-[#1B3A6B]' },
    { label: 'Total Cases', value: stats?.totalCases ?? '—', icon: FileText, href: '/dashboard/admin/users', color: 'text-[#2D6A4F]' },
    { label: 'Active Cases', value: stats?.activeCases ?? '—', icon: Activity, href: '/dashboard/admin/users', color: 'text-[#F0A500]' },
    { label: 'Pending Registrations', value: 'Review', icon: Shield, href: '/dashboard/admin/requests', color: 'text-saffron-dark' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A6B]">System Administration</h1>
        <p className="text-sm text-[#555] mt-1">NyayaSetu Admin Panel</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="border-[#D9D5C7] hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-4">
                <Icon className={`h-6 w-6 ${color} mb-2`} />
                <p className="text-2xl font-bold text-[#1B3A6B]">{value}</p>
                <p className="text-xs text-[#888] mt-1">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {stats?.usersByRole && (
        <Card className="border-[#D9D5C7]">
          <CardContent className="pt-4">
            <p className="font-semibold text-[#1B3A6B] mb-3">Users by Role</p>
            <div className="grid grid-cols-4 gap-4 text-center">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role}>
                  <p className="text-xl font-bold text-[#1B3A6B]">{count}</p>
                  <p className="text-xs text-[#888] capitalize">{role}s</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
