import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../api";
import { Card } from "../components/Card";

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    const path =
      user?.role === "judge"
        ? "/judge/cases"
        : user?.role === "lawyer"
          ? "/lawyer/cases"
          : "/citizen/cases";
    apiJson(path)
      .then((d) => {
        if (!cancel) setSummary(d);
      })
      .catch((e) => {
        if (!cancel) setErr(e.message);
      });
    return () => {
      cancel = true;
    };
  }, [user?.role]);

  const cases = summary?.cases || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("welcome")}</h1>
        <p className="text-slate-500">
          {user?.name} — <span className="capitalize">{user?.role}</span>
        </p>
      </div>
      {err && <p className="text-sm text-amber-700">{err}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {user?.role === "citizen" ? t("caseHistory") : t("assignedCases")}
          </p>
          <p className="mt-2 text-3xl font-bold text-nyaya-700">{cases.length}</p>
          <Link to="/app/cases" className="mt-3 inline-block text-sm font-medium text-nyaya-600 hover:underline">
            {t("cases")} →
          </Link>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("aiAssistant")}</p>
          <p className="mt-2 text-sm text-slate-600">Chat with NyayaAI for plain-language guidance.</p>
          <Link to="/app/ai" className="mt-3 inline-block text-sm font-medium text-nyaya-600 hover:underline">
            Open →
          </Link>
        </Card>
        {(user?.role === "judge" || user?.role === "lawyer") && (
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("calendar")}</p>
            <p className="mt-2 text-sm text-slate-600">Hearing dates and free slots.</p>
            <Link to="/app/calendar" className="mt-3 inline-block text-sm font-medium text-nyaya-600 hover:underline">
              Open →
            </Link>
          </Card>
        )}
      </div>
      {user?.role === "citizen" && (
        <Card title={t("newCase")}>
          <p className="text-sm text-slate-600">
            Describe your issue and optional FIR upload on the Cases page for AI triage.
          </p>
          <Link to="/app/cases" className="mt-2 inline-block text-sm font-medium text-nyaya-600 hover:underline">
            Go to intake →
          </Link>
        </Card>
      )}
    </div>
  );
}
