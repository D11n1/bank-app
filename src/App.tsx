import { Suspense, ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/components/home";
import Dashboard from "@/components/Dashboard";
import Profile from "@/components/Profile";
import AdminDashboard from "@/components/AdminDashboard";
import ContactPage from "@/components/ContactPage";
import FAQPage from "@/components/FAQPage";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";

interface AdminRouteProps {
  children: React.ReactNode;
}

function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();

  if (!user || !user.profile?.is_admin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Routes>
          {/* Tempo routes first */}
          {import.meta.env.VITE_TEMPO && (
            <Route path="/tempobook/*" element={<></>} />
          )}

          {/* App routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;
