'use client';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoice } from '@/hooks/useVoice';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const { isListening, error, startListening, stopListening } = useVoice();

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        if (text) onTranscript(text);
      });
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        size="icon"
        variant={isListening ? 'destructive' : 'outline'}
        onClick={handleClick}
        disabled={disabled}
        title={isListening ? 'Stop recording' : 'Speak your question (English or Hindi)'}
      >
        {isListening ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      {error && (
        <p className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs text-red-600 bg-white border border-red-200 rounded px-2 py-1 whitespace-nowrap shadow-sm">
          {error}
        </p>
      )}
    </div>
  );
}
