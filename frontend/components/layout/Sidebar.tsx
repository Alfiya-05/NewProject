'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, FileText, Users, Shield, Calendar,
  MessageSquare, Upload, Briefcase, BookOpen, BarChart2, Settings
} from 'lucide-react';

const NAV_BY_ROLE: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  citizen: [
    { href: '/dashboard/user', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/user/case', label: 'My Case', icon: FileText },
    { href: '/dashboard/user/hire', label: 'Hire a Lawyer', icon: Briefcase },
    { href: '/dashboard/user/documents', label: 'Documents', icon: Upload },
    { href: '/dashboard/user/support', label: 'AI Support', icon: MessageSquare },
  ],
  lawyer: [
    { href: '/dashboard/lawyer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/lawyer/requests', label: 'Case Requests', icon: BookOpen },
    { href: '/dashboard/lawyer/cases', label: 'My Cases', icon: FileText },
    { href: '/dashboard/lawyer/evidence', label: 'Evidence Vault', icon: Shield },
    { href: '/dashboard/lawyer/calendar', label: 'Calendar', icon: Calendar },
  ],
  judge: [
    { href: '/dashboard/judge', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/judge/active', label: 'Active Cases', icon: FileText },
    { href: '/dashboard/judge/pending', label: 'Pending Cases', icon: BookOpen },
    { href: '/dashboard/judge/calendar', label: 'Hearing Calendar', icon: Calendar },
    { href: '/dashboard/judge/analysis', label: 'AI Analysis', icon: BarChart2 },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'User Management', icon: Users },
    { href: '/dashboard/admin/audit', label: 'Audit Log', icon: Shield },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = NAV_BY_ROLE[user.role] ?? [];

  return (
    <aside className="w-64 glass-panel border-r border-white/60 min-h-screen flex flex-col py-6 px-4 shrink-0 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.05)] z-40 relative">
      <nav className="flex flex-col gap-1.5">
        <p className="text-xs font-bold text-navy/40 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== `/dashboard/${user.role}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden',
                isActive
                  ? 'bg-white text-navy shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 font-semibold'
                  : 'text-slate-500 hover:bg-slate-100/60 hover:text-navy border border-transparent'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-saffron rounded-r-full shadow-[0_0_8px_rgba(240,165,0,0.6)]"></span>
              )}
              <Icon 
                className={cn(
                  'h-4 w-4 relative z-10 transition-transform group-hover:scale-110', 
                  isActive ? 'text-saffron' : 'text-navy/50 group-hover:text-saffron'
                )} 
              />
              <span className="relative z-10 tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-navy/5 px-4 mb-2">
        <div className="bg-white/40 rounded-xl p-3 border border-white/50 backdrop-blur-md">
          <p className="text-[10px] font-bold text-navy/50 uppercase tracking-widest mb-1">System ID</p>
          <p className="text-xs font-mono font-medium text-navy/80 truncate mb-1">{user.systemUid}</p>
          <p className="text-[11px] text-navy/60 truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}
