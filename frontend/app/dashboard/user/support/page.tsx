'use client';
import { AIChatBox } from '@/components/chat/AIChatBox';
import { useCases } from '@/hooks/useCase';

export default function SupportPage() {
  const { cases } = useCases();
  const caseId = cases[0]?._id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A6B]">AI Legal Support</h1>
        <p className="text-sm text-[#555] mt-1">
          Ask questions about your case in Hindi or English. Use the mic button to speak.
        </p>
      </div>
      <AIChatBox caseId={caseId} />
    </div>
  );
}
