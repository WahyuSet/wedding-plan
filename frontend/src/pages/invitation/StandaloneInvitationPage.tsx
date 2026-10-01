import React, { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import axios from "axios";
import type { DigitalInvitation } from "../../types/index.js";
import { API_BASE_URL } from "../../lib/api.js";
import { invitationPath } from "../../lib/invitationLinks.js";
import { InvitationView } from "./InvitationView.js";
import type { InvitationGuestInfo } from "./shared/types.js";
import type { RsvpPayload } from "./shared/useRsvpForm.js";

const MAX_NAME_LENGTH = 80;

interface PublicGuestResponse {
  success: boolean;
  data: { name: string; category: string; hasRsvp: boolean; key: string | null };
}

const errorMessage = (status?: number): { title: string; body: string } => {
  if (status === 403) {
    return {
      title: "Undangan Belum Dipublikasikan",
      body: "Undangan ini belum dipublikasikan oleh mempelai atau modulnya sedang dinonaktifkan.",
    };
  }
  if (status === 503) {
    return { title: "Sedang Pemeliharaan", body: "Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti." };
  }
  return {
    title: "Undangan Tidak Ditemukan",
    body: "Tautan undangan pernikahan digital ini mungkin salah atau sudah tidak tersedia.",
  };
};

const InvitationMessage: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
    <Heart className="w-12 h-12 text-rose-500 mx-auto" />
    <h1 className="text-xl font-bold font-serif">{title}</h1>
    <p className="text-xs text-slate-400 max-w-sm">{body}</p>
  </div>
);

// Path yang tidak dikenal di situs undangan.
export const InvitationNotFoundPage: React.FC = () => <InvitationMessage {...errorMessage()} />;

export const StandaloneInvitationPage: React.FC = () => {
  const { slug, guestKey: guestKeyParam } = useParams<{ slug: string; guestKey?: string }>();
  const [searchParams] = useSearchParams();
  // Tautan baru membawa tamu di path ("nama-kode"); tautan lama memakai ?g=kode.
  const guestKey = guestKeyParam || searchParams.get("g") || "";
  const legacyName = (searchParams.get("to") || "").slice(0, MAX_NAME_LENGTH);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const invitationQuery = useQuery<{ success: boolean; data: DigitalInvitation }>({
    queryKey: ["public-invitation", slug],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/invitation/public/${slug}`)).data,
    enabled: Boolean(slug),
    retry: false,
  });

  const guestQuery = useQuery<PublicGuestResponse>({
    queryKey: ["public-guest", slug, guestKey],
    queryFn: async () =>
      (await axios.get(`${API_BASE_URL}/invitation/public/${slug}/guests/${encodeURIComponent(guestKey)}`)).data,
    enabled: Boolean(slug && guestKey),
    retry: false,
  });

  // Rapikan URL ke bentuk kanonik bila tamu dibuka lewat tautan lama atau nama di URL tidak cocok.
  const guestResponse = guestQuery.data;
  const canonicalKey = guestResponse?.data.key;
  useEffect(() => {
    if (!slug || !guestResponse || !canonicalKey || canonicalKey === guestKeyParam) return;
    queryClient.setQueryData(["public-guest", slug, canonicalKey], guestResponse);
    navigate(invitationPath(slug, canonicalKey), { replace: true });
  }, [slug, guestResponse, canonicalKey, guestKeyParam, queryClient, navigate]);

  const rsvpMutation = useMutation({
    mutationFn: async (payload: RsvpPayload) => {
      const res = await axios.post(`${API_BASE_URL}/invitation/public/${slug}/rsvp`, {
        ...payload,
        ...(guestKey ? { guestCode: guestKey } : {}),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-invitation", slug] });
    },
  });

  if (invitationQuery.isLoading || (guestKey && guestQuery.isLoading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-widest uppercase font-serif text-amber-200/80">Memuat Undangan...</p>
      </div>
    );
  }

  const invitation = invitationQuery.data?.data;
  if (invitationQuery.error || !invitation) {
    const status = axios.isAxiosError(invitationQuery.error) ? invitationQuery.error.response?.status : undefined;
    return <InvitationMessage {...errorMessage(status)} />;
  }

  const resolvedGuest = guestQuery.data?.data;
  const guest: InvitationGuestInfo | null = resolvedGuest
    ? { name: resolvedGuest.name, code: guestKey }
    : legacyName
    ? { name: legacyName }
    : null;

  return (
    <InvitationView
      invitation={invitation}
      guest={guest}
      onRsvpSubmit={async (payload) => {
        await rsvpMutation.mutateAsync(payload);
      }}
      isSubmittingRsvp={rsvpMutation.isPending}
    />
  );
};
