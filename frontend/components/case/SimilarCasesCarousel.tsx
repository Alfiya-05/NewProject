import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
import { SimilarCase } from '@/types';

interface SimilarCasesCarouselProps {
  cases: SimilarCase[];
}

export function SimilarCasesCarousel({ cases }: SimilarCasesCarouselProps) {
  if (!cases || cases.length === 0) return null;

  return (
    <Card className="border-[#D9D5C7]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#1B3A6B]">
          <BookOpen className="h-5 w-5" />
          Similar Cases & Precedents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-3">
            {cases.map((c, i) => (
              <div
                key={i}
                className="min-w-[240px] max-w-[280px] border border-[#D9D5C7] rounded-lg p-3 bg-[#F8F7F2] shrink-0"
              >
                <p className="font-semibold text-sm text-[#1B3A6B] whitespace-normal leading-snug">
                  {c.caseName}
                </p>
                <p className="text-xs text-[#888] mt-1">
                  {c.court} · {c.year}
                </p>
                <p className="text-xs text-[#555] mt-2 whitespace-normal">{c.outcome}</p>
                <div className="flex items-center gap-1 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-[#1B3A6B]"
                    style={{ width: `${Math.round(c.similarityScore * 100)}%`, maxWidth: '100%' }}
                  />
                  <span className="text-xs text-[#888]">
                    {Math.round(c.similarityScore * 100)}% similar
                  </span>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
