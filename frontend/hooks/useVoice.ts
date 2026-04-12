'use client';
import { useState, useCallback } from 'react';
import { startSpeechRecognition } from '@/lib/azure-speech';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback((onComplete: (text: string) => void) => {
    setIsListening(true);
    setError(null);
    setTranscript('');

    startSpeechRecognition(
      (result) => {
        setTranscript(result.text);
        onComplete(result.text);
      },
      (err) => setError(err),
      () => setIsListening(false)
    );
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return { isListening, transcript, error, startListening, stopListening };
}
