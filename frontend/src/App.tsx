import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "./pages/auth/LoginPage.js";
import { RegisterPage } from "./pages/auth/RegisterPage.js";
import { DashboardLayout } from "./components/layout/DashboardLayout.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { BudgetPage } from "./pages/BudgetPage.js";
import { SeserahanPage } from "./pages/SeserahanPage.js";
import { OperasionalPage } from "./pages/OperasionalPage.js";
import { DokumenKuaPage } from "./pages/DokumenKuaPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";
import { InvitationAdminPage } from "./pages/InvitationAdminPage.js";
import { StandaloneInvitationPage } from "./pages/invitation/StandaloneInvitationPage.js";
import { LandingPage } from "./pages/LandingPage.js";
import { AdminRoute } from "./components/AdminRoute.js";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes cache
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
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
            <Route path="/invitation-admin" element={<InvitationAdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Standalone Public Digital Wedding Invitation (Inveet-style, no dashboard layout) */}
          <Route path="/invitation/:slug" element={<StandaloneInvitationPage />} />

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
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
