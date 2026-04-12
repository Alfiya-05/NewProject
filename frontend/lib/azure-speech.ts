'use client';
// This file must only be imported from 'use client' components

export interface SpeechRecognitionResult {
  text: string;
  language: string;
  confidence: number;
}

export async function startSpeechRecognition(
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (error: string) => void,
  onEnd: () => void
): Promise<void> {
  const AZURE_SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
  const AZURE_SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    onError('Azure Speech credentials not configured');
    onEnd();
    return;
  }

  try {
    // Dynamic import to prevent SSR issues
    const SpeechSDK = await import('microsoft-cognitiveservices-speech-sdk');

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = 'en-IN';

    const autoDetectConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages([
      'en-IN',
      'hi-IN',
    ]);

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = SpeechSDK.SpeechRecognizer.FromConfig(
      speechConfig,
      autoDetectConfig,
      audioConfig
    );

    recognizer.recognizeOnceAsync(
      (result) => {
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const detectedLanguage =
            SpeechSDK.AutoDetectSourceLanguageResult.fromResult(result).language ?? 'en-IN';
          onResult({
            text: result.text,
            language: detectedLanguage,
            confidence: 1.0,
          });
        } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
          onError('No speech detected. Please speak clearly.');
        } else {
          onError(`Recognition failed: ${SpeechSDK.ResultReason[result.reason]}`);
        }
        onEnd();
        recognizer.close();
      },
      (err) => {
        onError(`Azure Speech error: ${err}`);
        onEnd();
        recognizer.close();
      }
    );
  } catch (err) {
    onError(`Failed to initialize speech recognition: ${err}`);
    onEnd();
  }
}
