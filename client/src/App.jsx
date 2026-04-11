import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/Layout/AppLayout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Cases } from "./pages/Cases";
import { AIAssistant } from "./pages/AIAssistant";
import { Calendar } from "./pages/Calendar";
import { Documents } from "./pages/Documents";
import { Profile } from "./pages/Profile";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/app"
            element={
              <Protected>
                <AppLayout />
              </Protected>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cases" element={<Cases />} />
            <Route path="cases/:id" element={<Cases />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="calendar" element={<Calendar />} />
            <Route
              path="documents"
              element={
                <RoleRoute roles={["lawyer"]}>
                  <Documents />
                </RoleRoute>
              }
            />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
