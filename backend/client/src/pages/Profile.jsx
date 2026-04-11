import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/Card";

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("profile")}</h1>
      <Card>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase text-slate-400">{t("name")}</dt>
            <dd className="text-slate-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-400">{t("email")}</dt>
            <dd className="text-slate-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-400">{t("role")}</dt>
            <dd className="capitalize text-slate-900">{user?.role}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
