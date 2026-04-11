import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? "bg-nyaya-600 text-white shadow-md shadow-nyaya-600/25" : "text-slate-600 hover:bg-nyaya-50"
  }`;

export function Sidebar({ onNavigate }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role;

  const items = [{ to: "/app/dashboard", key: "dashboard", label: t("dashboard") }];
  items.push({ to: "/app/cases", key: "cases", label: t("cases") });
  items.push({ to: "/app/ai", key: "ai", label: t("aiAssistant") });
  if (role === "judge" || role === "lawyer") {
    items.push({ to: "/app/calendar", key: "cal", label: t("calendar") });
  }
  if (role === "lawyer") {
    items.push({ to: "/app/documents", key: "docs", label: t("documents") });
  }
  items.push({ to: "/app/profile", key: "prof", label: t("profile") });

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/90 px-3 py-6 backdrop-blur">
      <div className="mb-8 px-2 text-lg font-semibold tracking-tight text-nyaya-800">
        {t("appName")} <span aria-hidden>⚖️</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((it) => (
          <NavLink key={it.key} to={it.to} className={linkClass} onClick={() => onNavigate?.()}>
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
