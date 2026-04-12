'use client';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Scale, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLE_LABELS: Record<string, string> = {
  citizen: 'Citizen',
  lawyer: 'Advocate',
  judge: 'Hon. Judge',
  admin: 'Administrator',
};

export function Topbar() {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm border-b border-navy/10 flex flex-col">
      {/* Government marquee bar */}
      <div className="bg-saffron text-navy font-bold text-[11px] uppercase tracking-wider py-1.5 px-4 text-center">
        This is a Non-Official Government of India Portal.Made by Team Bug_Busters
      </div>
      
      {/* Main topbar with Glassmorphism */}
      <div className="bg-navy/95 backdrop-blur-md text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner flex items-center justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Ashok Stambh" className="h-9 w-auto drop-shadow-md brightness-0 invert" style={{ filter: 'brightness(0) invert(1) drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
          </div>
          <div>
            <h1 className="font-heading text-xl font-extrabold tracking-tighter bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent drop-shadow-sm uppercase leading-none">NyayaSetu</h1>
            <p className="text-blue-200/90 text-[10px] font-bold uppercase tracking-widest mt-1">Indian Judiciary Portal</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white/95">{user.profile.name}</p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                <p className="text-xs text-saffron font-medium">
                  {ROLE_LABELS[user.role]} · {user.systemUid}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full ring-2 ring-saffron/80 ring-offset-2 ring-offset-navy focus:outline-none transition-all hover:scale-105 hover:ring-saffron">
                  <Avatar className="h-10 w-10 border border-white/20 shadow-sm">
                    <AvatarImage src={user.profile.photoURL} />
                    <AvatarFallback className="bg-saffron text-navy font-bold text-sm">
                      {user.profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-panel rounded-xl mt-2 p-1 border-white/40 shadow-lg">
                <DropdownMenuItem className="gap-2 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-navy/5 focus:bg-navy/5" onClick={() => router.push(`/dashboard/${user.role}`)}>
                  <User className="h-4 w-4 text-navy" />
                  <span className="font-medium text-navy">My Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-3 py-2.5 mt-1 cursor-pointer rounded-lg text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Secure Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
