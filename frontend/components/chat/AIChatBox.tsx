'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceInput } from './VoiceInput';
import { api } from '@/lib/api';
import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

interface AIChatBoxProps {
  caseId?: string;
}

export function AIChatBox({ caseId }: AIChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Namaste! I am NyayaSetu, your AI legal assistant. How can I help you with your case today? You can ask me in Hindi or English.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        caseId,
        message: text,
        history: messages.slice(-10),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-[#D9D5C7] rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#1B3A6B] text-white px-4 py-3 flex items-center gap-2">
        <Bot className="h-5 w-5 text-[#F0A500]" />
        <div>
          <p className="font-semibold text-sm">NyayaSetu AI Assistant</p>
          <p className="text-xs text-blue-300">Powered by Claude · Supports Hindi & English</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-[#1B3A6B] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-[#F0A500]" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-[#1B3A6B] text-white rounded-tr-sm'
                  : 'bg-[#F8F7F2] text-[#1A1A1A] rounded-tl-sm border border-[#D9D5C7]'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="h-7 w-7 rounded-full bg-[#F0A500] flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-[#1B3A6B]" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="h-7 w-7 rounded-full bg-[#1B3A6B] flex items-center justify-center">
              <Bot className="h-4 w-4 text-[#F0A500]" />
            </div>
            <div className="bg-[#F8F7F2] rounded-2xl rounded-tl-sm px-4 py-2.5 border border-[#D9D5C7]">
              <Loader2 className="h-4 w-4 animate-spin text-[#888]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#D9D5C7] p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Type your question (Hindi or English)..."
          className="flex-1 text-sm border border-[#D9D5C7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        />
        <VoiceInput onTranscript={(text) => sendMessage(text)} disabled={loading} />
        <Button
          size="icon"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="bg-[#1B3A6B] hover:bg-[#152d55] text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
