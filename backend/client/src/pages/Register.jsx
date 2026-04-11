import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await register(name, email, password, role);
      nav("/app/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nyaya-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-nyaya-900/5">
        <h1 className="mb-6 text-center text-2xl font-bold text-nyaya-900">{t("register")}</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t("name")}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-nyaya-500 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t("role")}</label>
            <div className="grid grid-cols-3 gap-2">
              {["judge", "lawyer", "citizen"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium capitalize ${
                    role === r
                      ? "border-nyaya-600 bg-nyaya-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-nyaya-300"
                  }`}
                >
                  {t(r)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t("email")}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-nyaya-500 focus:ring-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t("password")}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-nyaya-500 focus:ring-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-nyaya-600 py-3 text-sm font-semibold text-white shadow-lg shadow-nyaya-600/30 hover:bg-nyaya-700 disabled:opacity-60"
          >
            {busy ? "…" : t("register")}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-nyaya-600 hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
