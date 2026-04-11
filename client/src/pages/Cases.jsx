import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { apiJson, apiUpload } from "../api";
import { Card } from "../components/Card";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function Cases() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const nav = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState(null);

  const [citizenText, setCitizenText] = useState("");
  const [partyRole, setPartyRole] = useState("accuser");
  const [firFile, setFirFile] = useState(null);
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [lawyerCaseId, setLawyerCaseId] = useState("");
  const [uploadKind, setUploadKind] = useState("evidence");
  const [witnesses, setWitnesses] = useState("");
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState([]);

  const loadCases = () => {
    const path =
      user?.role === "judge"
        ? "/judge/cases"
        : user?.role === "lawyer"
          ? "/lawyer/cases"
          : "/citizen/cases";
    return apiJson(path).then((d) => setCases(d.cases || []));
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadCases()
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (user?.role !== "judge" || !id) {
      setDetail(null);
      return;
    }
    apiJson(`/judge/case/${id}`)
      .then(setDetail)
      .catch((e) => setErr(e.message));
  }, [user?.role, id]);

  useEffect(() => {
    if (user?.role === "lawyer" && cases.length && !lawyerCaseId) {
      setLawyerCaseId(cases[0].id);
    }
  }, [user?.role, cases, lawyerCaseId]);

  const runCitizenAnalyze = async (e) => {
    e.preventDefault();
    setErr("");
    const fd = new FormData();
    fd.append("text", citizenText);
    fd.append("partyRole", partyRole);
    if (firFile) fd.append("fir", firFile);
    try {
      const out = await apiUpload("/citizen/analyze", fd);
      setAnalyzeResult(out);
      await loadCases();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const onLawyerUpload = async (e) => {
    e.preventDefault();
    if (!lawyerCaseId || !files.length) return;
    setErr("");
    const fd = new FormData();
    fd.append("caseId", lawyerCaseId);
    fd.append("kind", uploadKind);
    fd.append("witnesses", witnesses);
    files.forEach((f) => fd.append("files", f));
    try {
      await apiUpload("/lawyer/upload", fd);
      setFiles([]);
      await loadCases();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  if (user?.role === "judge" && id) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => nav("/app/cases")} className="text-sm font-medium text-nyaya-600">
          ← {t("cases")}
        </button>
        {!detail && <p className="text-slate-500">Loading…</p>}
        {detail && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{detail.case.title}</h1>
              <p className="text-slate-500">
                {t("caseType")}: {detail.case.type} · {t("nextHearing")}: {formatDate(detail.case.nextHearingAt)}
              </p>
            </div>
            <Card title={t("aiSummary")}>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{detail.ai.summary}</p>
            </Card>
            <Card title={t("highlights")}>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                {(detail.ai.highlights || []).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </Card>
            <Card title={t("risks")}>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                {(detail.ai.riskInsights || []).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">{t("cases")}</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cases.map((c) => (
            <Card key={c.id} className="hover:border-nyaya-200">
              <h3 className="font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {t("caseType")}: {c.type}
              </p>
              <p className="text-xs text-slate-500">
                {t("nextHearing")}: {formatDate(c.nextHearingAt)}
              </p>
              {user?.role === "judge" && (
                <Link
                  to={`/app/cases/${c.id}`}
                  className="mt-3 inline-block text-sm font-medium text-nyaya-600 hover:underline"
                >
                  {t("viewDetails")}
                </Link>
              )}
              {user?.role === "lawyer" && c.timeline && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">{t("timeline")}</p>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-nyaya-400 to-nyaya-600 transition-all"
                      style={{
                        width: `${(() => {
                          const done = c.timeline.filter((s) => s.done).map((s) => s.percent);
                          return done.length ? Math.max(...done) : 12;
                        })()}%`,
                      }}
                    />
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {c.timeline.map((s) => (
                      <li key={s.label}>
                        {s.done ? "✓" : "○"} {s.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {user?.role === "citizen" && c.aiAnalysis && (
                <p className="mt-2 line-clamp-2 text-xs text-slate-600">{c.aiAnalysis.summary}</p>
              )}
            </Card>
          ))}
          {cases.length === 0 && <p className="text-slate-500">No cases yet.</p>}
        </div>
      )}

      {user?.role === "citizen" && (
        <Card title={t("newCase")}>
          <form onSubmit={runCitizenAnalyze} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">{t("partyRole")}</label>
              <div className="flex gap-2">
                {["accuser", "accused"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setPartyRole(r)}
                    className={`rounded-xl border px-4 py-2 text-sm capitalize ${
                      partyRole === r ? "border-nyaya-600 bg-nyaya-50 text-nyaya-800" : "border-slate-200"
                    }`}
                  >
                    {t(r)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">{t("describeSituation")}</label>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-nyaya-500 focus:ring-2"
                value={citizenText}
                onChange={(e) => setCitizenText(e.target.value)}
                placeholder="Describe what happened…"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">FIR / document (optional)</label>
              <input type="file" onChange={(e) => setFirFile(e.target.files?.[0] || null)} className="text-sm" />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-nyaya-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nyaya-700"
            >
              {t("analyze")}
            </button>
          </form>
          {analyzeResult && (
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
              <h4 className="font-semibold text-slate-800">{t("output")}</h4>
              <p className="text-sm">
                <span className="font-medium text-nyaya-700">{t("caseType")}:</span> {analyzeResult.caseType}
              </p>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{analyzeResult.summary}</p>
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">{t("suggestedActions")}</p>
                <ul className="list-inside list-disc text-sm text-slate-700">
                  {(analyzeResult.actions || []).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-medium">{t("estimatedTimeline")}:</span> {analyzeResult.timeline}
              </p>
            </div>
          )}
        </Card>
      )}

      {user?.role === "lawyer" && (
        <Card title={t("uploadEvidence")}>
          <form onSubmit={onLawyerUpload} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">{t("selectCase")}</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={lawyerCaseId}
                onChange={(e) => setLawyerCaseId(e.target.value)}
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Upload type</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={uploadKind}
                onChange={(e) => setUploadKind(e.target.value)}
              >
                <option value="evidence">Evidence</option>
                <option value="document">Document</option>
                <option value="fir">FIR</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">{t("witnesses")}</label>
              <textarea
                className="min-h-[72px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={witnesses}
                onChange={(e) => setWitnesses(e.target.value)}
              />
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                setFiles([...files, ...Array.from(e.dataTransfer.files)]);
              }}
              className={`rounded-2xl border-2 border-dashed px-4 py-10 text-center text-sm transition ${
                drag ? "border-nyaya-500 bg-nyaya-50" : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <p className="text-slate-600">{t("dragDrop")}</p>
              <input
                type="file"
                multiple
                className="mt-3 text-sm"
                onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])])}
              />
              {files.length > 0 && (
                <ul className="mt-3 text-left text-xs text-slate-600">
                  {files.map((f, i) => (
                    <li key={i}>{f.name}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              disabled={!lawyerCaseId || !files.length}
              className="rounded-xl bg-nyaya-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nyaya-700 disabled:opacity-50"
            >
              {t("save")}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
