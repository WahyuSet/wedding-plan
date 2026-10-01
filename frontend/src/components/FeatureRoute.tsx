import React from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { usePublicSettings, type PublicSettings } from "../hooks/usePublicSettings.js";

type FlagKey = "digital_invitation";

interface FeatureRouteProps {
  flag: FlagKey & keyof PublicSettings;
  children: React.ReactNode;
}

export const FeatureRoute: React.FC<FeatureRouteProps> = ({ flag, children }) => {
  const { settings, isLoading } = usePublicSettings();

  if (isLoading) return null;

  if (!settings[flag]) {
    toast.info("Fitur ini sedang dinonaktifkan oleh administrator.");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
