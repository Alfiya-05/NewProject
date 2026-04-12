import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { IPCSection } from '@/types';

interface IPCSectionsPanelProps {
  sections: IPCSection[];
}

export function IPCSectionsPanel({ sections }: IPCSectionsPanelProps) {
  if (!sections || sections.length === 0) {
    return (
      <Card className="border-[#D9D5C7]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1B3A6B]">
            <Scale className="h-5 w-5" />
            IPC / BNS Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#888] text-sm">No IPC sections detected yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#D9D5C7]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#1B3A6B]">
          <Scale className="h-5 w-5" />
          IPC / BNS Sections ({sections.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={i} className="border border-[#D9D5C7] rounded-lg p-3 bg-[#F8F7F2]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#1B3A6B] text-sm">
                  {s.act} §{s.section}
                </span>
                <div className="flex gap-1">
                  <span className={s.isBailable ? 'badge-active' : 'badge-urgent'}>
                    {s.isBailable ? 'Bailable' : 'Non-Bailable'}
                  </span>
                  <span className={s.isCognizable ? 'badge-urgent' : 'badge-immutable'}>
                    {s.isCognizable ? 'Cognizable' : 'Non-Cognizable'}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]">{s.title}</p>
              <p className="text-xs text-[#555] mt-1">{s.description}</p>
              <p className="text-xs text-[#888] mt-1">
                Punishment: {s.minPunishmentYears}–{s.maxPunishmentYears} years
                {s.fineApplicable ? ' + Fine' : ''}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
