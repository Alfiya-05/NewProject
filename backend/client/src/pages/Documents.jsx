import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiJson } from "../api";
import { Card } from "../components/Card";

export function Documents() {
  const { t } = useTranslation();
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiJson("/lawyer/cases")
      .then((d) => {
        const list = d.cases || [];
        setCases(list);
        if (list[0]) setSelected(list[0].id);
      })
      .catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    apiJson(`/lawyer/case/${selected}`)
      .then(setDetail)
      .catch((e) => setErr(e.message));
  }, [selected]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("documents")}</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="max-w-xl">
        <label className="mb-1 block text-xs font-medium text-slate-600">{t("selectCase")}</label>
        <select
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      {detail && (
        <Card title="Uploaded files">
          <ul className="divide-y divide-slate-100">
            {(detail.case.documents || []).length === 0 && (
              <li className="py-3 text-sm text-slate-500">No documents yet. Upload from Cases.</li>
            )}
            {(detail.case.documents || []).map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-medium text-slate-800">{d.originalName || "file"}</span>
                <span className="text-xs uppercase text-slate-400">{d.kind}</span>
                <a
                  href={d.fileUrl}
                  className="text-xs font-medium text-nyaya-600 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
