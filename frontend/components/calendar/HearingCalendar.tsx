'use client';
import { useEffect, useRef, useState } from 'react';
import { Hearing } from '@/types';

interface HearingCalendarProps {
  hearings: Hearing[];
  editable?: boolean;
  onDateClick?: (date: string) => void;
  onEventClick?: (hearing: Hearing) => void;
}

// Lazy-load FullCalendar to avoid SSR issues
export function HearingCalendar({ hearings, editable, onDateClick, onEventClick }: HearingCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [CalendarComponent, setCalendarComponent] = useState<React.ComponentType<unknown> | null>(null);

  useEffect(() => {
    // Dynamic imports to prevent SSR errors with FullCalendar
    Promise.all([
      import('@fullcalendar/react'),
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/interaction'),
    ]).then(([{ default: FullCalendar }, dayGridPlugin, interactionPlugin]) => {
      const FC = () => (
        <FullCalendar
          plugins={[dayGridPlugin.default, interactionPlugin.default]}
          initialView="dayGridMonth"
          events={hearings.map((h) => ({
            id: h._id,
            title: `${h.courtRoom ?? 'Court'} · ${h.status}`,
            date: h.hearingDate,
            backgroundColor:
              h.status === 'scheduled'
                ? '#1B3A6B'
                : h.status === 'completed'
                  ? '#2D6A4F'
                  : h.status === 'cancelled'
                    ? '#A32D2D'
                    : '#F0A500',
            borderColor: 'transparent',
          }))}
          dateClick={
            editable && onDateClick
              ? (info: { dateStr: string }) => onDateClick(info.dateStr)
              : undefined
          }
          eventClick={
            onEventClick
              ? (info: { event: { id: string } }) => {
                  const h = hearings.find((x) => x._id === info.event.id);
                  if (h) onEventClick(h);
                }
              : undefined
          }
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth',
          }}
          height="auto"
        />
      );
      setCalendarComponent(() => FC);
    });
  }, [hearings, editable, onDateClick, onEventClick]);

  if (!CalendarComponent) {
    return (
      <div className="h-96 flex items-center justify-center text-[#888] text-sm">
        Loading calendar...
      </div>
    );
  }

  return (
    <div ref={calendarRef} className="bg-white rounded-xl border border-[#D9D5C7] p-4">
      <CalendarComponent />
    </div>
  );
}
