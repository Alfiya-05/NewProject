import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

export function Topbar({ onMenu }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const toggleLang = () => {
    const next = i18n.language === "hi" ? "en" : "hi";
    i18n.changeLanguage(next);
    localStorage.setItem("nyaya_lang", next);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-nyaya-50 md:hidden"
          onClick={onMenu}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-lg font-semibold text-nyaya-900">
          NyayaAI <span className="text-nyaya-500">⚖️</span>
        </span>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button
          type="button"
          onClick={toggleLang}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:border-nyaya-300 hover:text-nyaya-700"
        >
          {t("language")}: {i18n.language === "hi" ? t("hindi") : t("english")}
        </button>
        <button
          type="button"
          className="hidden rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:border-nyaya-300 sm:block"
          title={t("notifications")}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        <div className="flex items-center gap-2 rounded-2xl bg-nyaya-50 px-3 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nyaya-600 text-sm font-semibold text-white">
            {(user?.name || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          {t("signOut")}
        </button>
      </div>
    </header>
  );
}
