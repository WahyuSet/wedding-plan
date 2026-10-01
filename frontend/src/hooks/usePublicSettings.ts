import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";

export interface PublicSettings {
  digital_invitation: boolean;
  user_registration: boolean;
  system_maintenance: boolean;
  // Origin domain khusus undangan; null berarti undangan dibuka di domain dashboard.
  invitation_url: string | null;
}

const DEFAULT_SETTINGS: PublicSettings = {
  digital_invitation: true,
  user_registration: true,
  system_maintenance: false,
  invitation_url: null,
};

export const usePublicSettings = () => {
  const query = useQuery<PublicSettings>({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await api.get("/settings/public");
      return { ...DEFAULT_SETTINGS, ...res.data.data };
    },
    staleTime: 30_000,
  });

  return { settings: query.data ?? DEFAULT_SETTINGS, isLoading: query.isLoading };
};
