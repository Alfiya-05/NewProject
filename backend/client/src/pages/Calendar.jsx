import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../api";
import { Card } from "../components/Card";

export function Calendar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user?.role !== "judge" && user?.role !== "lawyer") return;
    const url = user?.role === "judge" ? "/judge/calendar" : "/lawyer/calendar";
    apiJson(url)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [user?.role]);

  if (user?.role !== "judge" && user?.role !== "lawyer") {
    return <p className="text-slate-500">Calendar is available for judges and lawyers.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("calendar")}</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {data?.note && <p className="text-sm text-slate-600">{data.note}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        <Card title={t("bookedHearings")}>
          <ul className="space-y-2 text-sm">
            {(data?.booked || []).map((b, i) => (
              <li key={i} className="rounded-xl bg-nyaya-50 px-3 py-2 text-slate-800">
                <span className="font-medium">{new Date(b.date).toLocaleString()}</span>
                <span className="text-slate-600"> — {b.title}</span>
              </li>
            ))}
            {user?.role === "judge" && (!data?.booked || data.booked.length === 0) && (
              <li className="text-slate-500">No hearings in range.</li>
            )}
          </ul>
        </Card>
        <Card title={t("freeDates")}>
          <div className="flex flex-wrap gap-2">
            {(data?.freeDates || []).slice(0, 24).map((d) => (
              <span key={d} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                {d}
              </span>
            ))}
          </div>
          {user?.role === "judge" && (!data?.freeDates || data.freeDates.length === 0) && (
            <p className="text-sm text-slate-500">No free weekdays computed in window.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
