import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  role: string;
  label: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

export function RoleCard({ label, description, icon: Icon, selected, onClick }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 text-center w-full',
        selected
          ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white shadow-lg scale-105'
          : 'border-[#D9D5C7] bg-white text-[#1A1A1A] hover:border-[#F0A500] hover:shadow-md'
      )}
    >
      <Icon
        className={cn('h-8 w-8', selected ? 'text-[#F0A500]' : 'text-[#1B3A6B]')}
      />
      <div>
        <p className="font-semibold text-lg">{label}</p>
        <p className={cn('text-sm mt-1', selected ? 'text-blue-200' : 'text-[#555]')}>
          {description}
        </p>
      </div>
    </button>
  );
}
