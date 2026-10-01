import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "./components/layout/DashboardLayout.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { AdminRoute } from "./components/AdminRoute.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { FeatureRoute } from "./components/FeatureRoute.js";
import { LandingPage } from "./pages/LandingPage.js";
import { isInvitationSite } from "./lib/site.js";
import { publicInvitationUrl } from "./lib/invitationLinks.js";
import { usePublicSettings } from "./hooks/usePublicSettings.js";
import { Toaster } from "sonner";

const LoginPage = lazy(() => import("./pages/auth/LoginPage.js").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.js").then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage.js").then((m) => ({ default: m.DashboardPage })));
const BudgetPage = lazy(() => import("./pages/BudgetPage.js").then((m) => ({ default: m.BudgetPage })));
const SeserahanPage = lazy(() => import("./pages/SeserahanPage.js").then((m) => ({ default: m.SeserahanPage })));
const OperasionalPage = lazy(() => import("./pages/OperasionalPage.js").then((m) => ({ default: m.OperasionalPage })));
const DokumenKuaPage = lazy(() => import("./pages/DokumenKuaPage.js").then((m) => ({ default: m.DokumenKuaPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage.js").then((m) => ({ default: m.SettingsPage })));
const InvitationAdminPage = lazy(() => import("./pages/InvitationAdminPage.js").then((m) => ({ default: m.InvitationAdminPage })));
const StandaloneInvitationPage = lazy(() => import("./pages/invitation/StandaloneInvitationPage.js").then((m) => ({ default: m.StandaloneInvitationPage })));
const InvitationNotFoundPage = lazy(() => import("./pages/invitation/StandaloneInvitationPage.js").then((m) => ({ default: m.InvitationNotFoundPage })));
const InvitationPreviewPage = lazy(() => import("./pages/invitation/InvitationPreviewPage.js").then((m) => ({ default: m.InvitationPreviewPage })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage.js").then((m) => ({ default: m.AdminDashboardPage })));

const PageFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
    <div className="w-8 h-8 border-4 border-rose-200 border-t-[#E11D48] rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes cache
      retry: 1,
    },
  },
});

// Di domain undangan hanya halaman undangan yang ada: slug pasangan langsung di akar path.
const InvitationSiteRoutes: React.FC = () => (
  <Routes>
    <Route path="/:slug/:guestKey?" element={<StandaloneInvitationPage />} />
    <Route path="*" element={<InvitationNotFoundPage />} />
  </Routes>
);

// Tautan undangan lama di domain dashboard. Bila undangan punya domain sendiri, tamu dialihkan
// ke sana dengan query (?g= kode tamu lama, ?to= nama) tetap dibawa.
const DashboardInvitationRoute: React.FC = () => {
  const { settings, isLoading } = usePublicSettings();
  const { slug, guestKey } = useParams<{ slug: string; guestKey?: string }>();
  const { search } = useLocation();

  const target =
    settings.invitation_url && slug
      ? `${publicInvitationUrl(slug, guestKey, settings.invitation_url)}${search}`
      : null;

  useEffect(() => {
    if (target) window.location.replace(target);
  }, [target]);

  if (isLoading || target) return <PageFallback />;
  return <StandaloneInvitationPage />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
        {isInvitationSite ? <InvitationSiteRoutes /> : (
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes (Flat layout routing) */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/seserahan" element={<SeserahanPage />} />
            <Route path="/operasional" element={<OperasionalPage />} />
            <Route path="/dokumen-kua" element={<DokumenKuaPage />} />
            <Route
              path="/invitation-admin"
              element={
                <FeatureRoute flag="digital_invitation">
                  <InvitationAdminPage />
                </FeatureRoute>
              }
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Standalone Public Digital Wedding Invitation (Inveet-style, no dashboard layout) */}
          {/* Segmen kedua opsional: tautan personal tamu berbentuk "nama-kode" */}
          <Route path="/invitation/:slug/:guestKey?" element={<DashboardInvitationRoute />} />

          {/* Pratinjau undangan di dalam iframe halaman admin (data dikirim via postMessage) */}
          <Route path="/invitation-preview" element={<InvitationPreviewPage />} />

          {/* Superadmin Console Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Catch-all to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        )}
        </Suspense>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
