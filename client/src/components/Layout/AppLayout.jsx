import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-nyaya-50/40">
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition md:hidden ${
          mobileNav ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileNav(false)}
        aria-hidden
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white shadow-xl transition md:static md:z-0 md:translate-x-0 md:shadow-none ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setMobileNav(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileNav(true)} />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
