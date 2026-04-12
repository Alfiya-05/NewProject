import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import { Case } from '@/types';

interface PunishmentWidgetProps {
  punishmentPrediction?: Case['punishmentPrediction'];
  timelinePrediction?: Case['timelinePrediction'];
}

export function PunishmentWidget({ punishmentPrediction, timelinePrediction }: PunishmentWidgetProps) {
  if (!punishmentPrediction && !timelinePrediction) {
    return (
      <Card className="border-[#D9D5C7]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1B3A6B]">
            <AlertTriangle className="h-5 w-5" />
            Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#888] text-sm">AI predictions not yet generated.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {punishmentPrediction && (
        <Card className="border-[#D9D5C7]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#1B3A6B] text-sm">
              <AlertTriangle className="h-4 w-4" />
              Punishment Range (AI Estimate)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className={punishmentPrediction.isBailable ? 'badge-active' : 'badge-urgent'}>
                {punishmentPrediction.isBailable ? 'Bailable Offence' : 'Non-Bailable Offence'}
              </span>
            </div>
            <div className="bg-[#F8F7F2] rounded-lg p-3">
              <p className="text-2xl font-bold text-[#1B3A6B]">
                {punishmentPrediction.minYears}–{punishmentPrediction.maxYears}{' '}
                <span className="text-base font-normal text-[#555]">years</span>
              </p>
              {punishmentPrediction.fineRange && (
                <p className="text-sm text-[#555] mt-1">Fine: {punishmentPrediction.fineRange}</p>
              )}
            </div>
            {punishmentPrediction.disclaimer && (
              <p className="text-xs text-[#888] mt-2 italic">{punishmentPrediction.disclaimer}</p>
            )}
          </CardContent>
        </Card>
      )}

      {timelinePrediction && (
        <Card className="border-[#D9D5C7]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#1B3A6B] text-sm">
              <Clock className="h-4 w-4" />
              Resolution Timeline (AI Estimate)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#F8F7F2] rounded-lg p-3 mb-3">
              <p className="text-2xl font-bold text-[#1B3A6B]">
                {timelinePrediction.medianMonths}{' '}
                <span className="text-base font-normal text-[#555]">months (median)</span>
              </p>
              <p className="text-sm text-[#555]">
                Range: {timelinePrediction.minMonths}–{timelinePrediction.maxMonths} months
              </p>
              {timelinePrediction.confidence && (
                <span className="badge-pending mt-1 inline-block">
                  {timelinePrediction.confidence} confidence
                </span>
              )}
            </div>
            {timelinePrediction.factors && timelinePrediction.factors.length > 0 && (
              <ul className="text-xs text-[#555] space-y-1">
                {timelinePrediction.factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-[#1B3A6B]">•</span> {f}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
