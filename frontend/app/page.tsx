'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, Sparkles } from 'lucide-react';

const QUOTES = [
  { text: "Justice delayed is justice denied.", author: "William E. Gladstone" },
  { text: "Let justice be done though the heavens fall.", author: "Legal Maxim" },
  { text: "The law is not a monument; it is a movement.", author: "Justice Oliver Wendell Holmes" },
  { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." }
];

export default function LoadingScreen() {
  const router = useRouter();
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3500); // 3.5 seconds for reading and atmosphere
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-mesh bg-fixed flex flex-col items-center justify-center relative overflow-hidden selection:bg-saffron/30">
      {/* Decorative background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-navy/5 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center">
        {/* Animated Icon Container */}
        <div className="relative mb-12 animate-in fade-in zoom-in duration-1000">
          <div className="absolute -inset-4 bg-saffron/20 blur-2xl rounded-full animate-pulse"></div>
          <div className="bg-white/40 p-6 rounded-[2.5rem] shadow-xl border border-white/60 backdrop-blur-md relative overflow-hidden group">
            <Scale className="h-16 w-16 text-saffron drop-shadow-md animate-bounce transition-all duration-[3000ms]" />
          </div>
        </div>

        {/* Content Section */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy/5 border border-navy/10 text-navy/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Initializing NyayaSetu
          </div>

          <blockquote className="space-y-4 mb-12">
            <p className="font-heading text-4xl md:text-5xl font-extrabold text-navy leading-tight italic drop-shadow-sm">
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="text-sm font-bold text-navy/30 uppercase tracking-[0.3em] font-sans">
              — {quote.author}
            </footer>
          </blockquote>

          {/* Loading Progress Bar */}
          <div className="w-64 h-1.5 bg-navy/5 rounded-full overflow-hidden mx-auto border border-navy/5 backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-navy/40 via-saffron to-navy/40 w-full -translate-x-full animate-[loading_3s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>

      {/* Styles for the unique loading animation */}
      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* NIC Footer */}
      <footer className="absolute bottom-12 w-full text-center animate-in fade-in duration-1000 delay-1000 fill-mode-both">
        <p className="text-[10px] font-bold text-navy/20 uppercase tracking-[0.4em]">
          Official Judicial Infrastructure
        </p>
      </footer>
    </div>
  );
}
