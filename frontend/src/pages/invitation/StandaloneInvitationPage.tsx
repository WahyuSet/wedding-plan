import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Music,
  Volume2,
  VolumeX,
  Send,
  Gift,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Instagram,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Mail,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { DigitalInvitation, LoveStoryItem, GalleryPhotoItem, BankAccountItem, InvitationRsvp } from "../../types/index.js";
import { formatDateIndo } from "../../lib/utils.js";
import { API_BASE_URL } from "../../lib/api.js";
import { ChalkAndVowTheme } from "./themes/ChalkAndVowTheme.js";
import { NoirCallaTheme } from "./themes/NoirCallaTheme.js";

// Theme configuration profiles
const THEME_STYLES = {
  "noir-calla": {
    bg: "bg-[#080B11]",
    text: "text-slate-100",
    textMuted: "text-slate-300",
    textAccent: "text-[#D4AF37]",
    headingFont: "font-serif",
    cardBg: "bg-[#0F1420]/90 backdrop-blur-md",
    cardBorder: "border-[#D4AF37]/25",
    accentColor: "#D4AF37",
    buttonPrimary: "bg-[#D4AF37] hover:bg-[#C59F2D] text-slate-950 font-bold",
    badge: "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30",
    divider: "border-slate-800",
    inputBg: "bg-[#0A0E17] border-[#D4AF37]/20 text-slate-200 placeholder-slate-400/60",
    scrimOverlay: "bg-gradient-to-t from-[#080B11]/80 via-[#080B11]/50 to-[#080B11]/85",
    bodyTexture: "radial-gradient(ellipse at top, rgba(212,175,55,0.06), transparent 70%), radial-gradient(ellipse at bottom, rgba(15,20,32,0.8), #080B11)",
  },
  "chalk-and-vow": {
    bg: "bg-[#FAF7F2]",
    text: "text-slate-900",
    textMuted: "text-slate-600",
    textAccent: "text-[#991B1B]",
    headingFont: "font-serif",
    cardBg: "bg-white/95 backdrop-blur-md",
    cardBorder: "border-stone-300/80",
    accentColor: "#991B1B",
    buttonPrimary: "bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold",
    badge: "bg-rose-50 text-[#991B1B] border border-rose-200",
    divider: "border-stone-200",
    inputBg: "bg-stone-50 border-stone-300 text-slate-900 placeholder-slate-400",
    scrimOverlay: "bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/80 to-[#FAF7F2]/70",
    bodyTexture: "radial-gradient(ellipse at top, rgba(153,27,27,0.03), transparent 60%), #FAF7F2",
  },
  "nocturne-botanica": {
    bg: "bg-[#04120D]",
    text: "text-emerald-50",
    textMuted: "text-emerald-200/70",
    textAccent: "text-[#EAB308]",
    headingFont: "font-serif",
    cardBg: "bg-[#0A2218]/90 backdrop-blur-md",
    cardBorder: "border-emerald-700/40",
    accentColor: "#EAB308",
    buttonPrimary: "bg-[#EAB308] hover:bg-[#CA8A04] text-slate-950 font-bold",
    badge: "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50",
    divider: "border-emerald-900/60",
    inputBg: "bg-[#061B13] border-emerald-800 text-white placeholder-emerald-600",
    scrimOverlay: "bg-gradient-to-t from-[#04120D] via-[#04120D]/75 to-[#04120D]/90",
    bodyTexture: "radial-gradient(ellipse at top, rgba(16,185,129,0.08), transparent 70%), radial-gradient(ellipse at bottom, rgba(4,18,13,0.9), #04120D)",
  },
};

export const StandaloneInvitationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get("to") || "";

  const queryClient = useQueryClient();
  const [isOpenEnvelope, setIsOpenEnvelope] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // RSVP Form state
  const [rsvpName, setRsvpName] = useState(guestName);
  const [attendance, setAttendance] = useState<"hadir" | "tidak_hadir" | "ragu">("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Public Invitation Data
  const { data, isLoading, error } = useQuery<{ success: boolean; data: DigitalInvitation }>({
    queryKey: ["public-invitation", slug],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/invitation/public/${slug}`);
      return res.data;
    },
    enabled: Boolean(slug),
  });

  const invitation = data?.data;
  const themeKey = (invitation?.theme || "noir-calla") as keyof typeof THEME_STYLES;
  const theme = THEME_STYLES[themeKey] || THEME_STYLES["noir-calla"];

  // Fallback default cover photo if empty
  const coverImage =
    invitation?.coverPhotoUrl ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85";

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!invitation) return;
    const targetDate = new Date(invitation.akadDate || invitation.resepsiDate || new Date()).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [invitation]);

  // Audio play handler
  const handleOpenInvitation = () => {
    setIsOpenEnvelope(true);
    if (invitation?.bgMusicUrl && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false));
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => {});
    }
  };

  // Submit RSVP Mutation
  const rsvpMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post(`${API_BASE_URL}/invitation/public/${slug}/rsvp`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-invitation", slug] });
      setMessage("");
      toast.success("Doa & Konfirmasi Terkirim!", {
        description: "Terima kasih banyak atas doa restu dan konfirmasi kehadiran Anda.",
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal mengirimkan RSVP");
    },
  });

  const copyAccount = (accNumber: string, idx: number) => {
    navigator.clipboard.writeText(accNumber);
    setCopiedIndex(idx);
    toast.success("Nomor Rekening Berhasil Disalin!", { description: accNumber });
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-widest uppercase font-serif text-amber-200/80">Memuat Undangan...</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
        <Heart className="w-12 h-12 text-rose-500 mx-auto" />
        <h1 className="text-xl font-bold font-serif">Undangan Tidak Ditemukan</h1>
        <p className="text-xs text-slate-400 max-w-sm">
          Tautan undangan pernikahan digital ini mungkin salah atau belum dipublikasikan oleh mempelai.
        </p>
      </div>
    );
  }

  const loveStories: LoveStoryItem[] = Array.isArray(invitation.loveStory) ? invitation.loveStory : [];
  const gallery: GalleryPhotoItem[] = Array.isArray(invitation.galleryPhotos) ? invitation.galleryPhotos : [];
  const bankAccounts: BankAccountItem[] = Array.isArray(invitation.bankAccounts) ? invitation.bankAccounts : [];
  const rsvps: InvitationRsvp[] = invitation.rsvps || [];

  // Dedicated Theme Architecture: Noir Calla (Dark Gold)
  if (invitation.theme === "noir-calla") {
    return (
      <>
        {invitation.bgMusicUrl && (
          <audio ref={audioRef} src={invitation.bgMusicUrl} loop preload="auto" />
        )}
        <NoirCallaTheme
          invitation={invitation}
          guestName={guestName}
          audioRef={audioRef}
          isPlayingMusic={isPlayingMusic}
          toggleMusic={toggleMusic}
          onRsvpSubmit={(payload) => rsvpMutation.mutateAsync(payload)}
          isSubmittingRsvp={rsvpMutation.isPending}
        />
      </>
    );
  }

  // Dedicated Theme Architecture: Chalk and Vow (Split Viewport)
  if (invitation.theme === "chalk-and-vow") {
    return (
      <>
        {invitation.bgMusicUrl && (
          <audio ref={audioRef} src={invitation.bgMusicUrl} loop preload="auto" />
        )}
        <ChalkAndVowTheme
          invitation={invitation}
          guestName={guestName}
          audioRef={audioRef}
          isPlayingMusic={isPlayingMusic}
          toggleMusic={toggleMusic}
          onRsvpSubmit={(payload) => rsvpMutation.mutateAsync(payload)}
          isSubmittingRsvp={rsvpMutation.isPending}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-[100dvh] ${theme.bg} ${theme.text} selection:bg-amber-400/30 transition-colors duration-500 relative`}
      style={{ background: theme.bodyTexture }}
    >
      <Toaster position="top-center" richColors />

      {/* Hidden HTML5 Audio Element */}
      {invitation.bgMusicUrl && (
        <audio ref={audioRef} src={invitation.bgMusicUrl} loop preload="auto" />
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. COVER / ENVELOPE OPENING SCREEN (With Real Background) */}
      {/* ──────────────────────────────────────────────────────── */}
      {!isOpenEnvelope && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden">
          {/* Full-bleed Background Photography */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url("${coverImage}")` }}
          />

          {/* Scrim Overlay Gradient for Cinematic Legibility */}
          <div className={`absolute inset-0 ${theme.scrimOverlay} backdrop-blur-xs`} />

          {/* Delicate Botanical Border Frame */}
          <div className="absolute inset-4 sm:inset-6 border border-white/15 rounded-3xl pointer-events-none z-10" />

          {/* Top Header */}
          <div className="relative z-20 pt-8 space-y-2 animate-fade-in text-center">
            <span className={`inline-block px-3.5 py-1 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold ${theme.badge}`}>
              The Wedding Invitation
            </span>
            <p className="text-xs tracking-widest uppercase opacity-75 font-medium">
              {invitation.title || "The Wedding of"}
            </p>
          </div>

          {/* Couple Monogram / Names */}
          <div className="relative z-20 my-auto space-y-5 animate-scale-up max-w-md text-center">
            {/* Monogram Seal */}
            <div className="w-20 h-20 mx-auto rounded-full border border-amber-400/60 bg-black/40 backdrop-blur-md flex items-center justify-center p-2 shadow-2xl">
              <span className={`text-2xl font-serif font-black ${theme.textAccent}`}>
                {invitation.groomNickName?.charAt(0) || "P"}&amp;{invitation.brideNickName?.charAt(0) || "W"}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingFont} tracking-tight leading-tight`}>
                {invitation.groomNickName || "Mempelai Pria"} &amp; {invitation.brideNickName || "Mempelai Wanita"}
              </h1>
              <p className="text-xs opacity-75 font-medium">
                {invitation.akadDate ? formatDateIndo(invitation.akadDate) : "Tanggal Bahagia"}
              </p>
            </div>

            {/* Guest Personalization Card */}
            {guestName && (
              <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xl space-y-1 max-w-xs mx-auto`}>
                <p className="text-[11px] opacity-75">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                <p className={`text-base font-extrabold font-serif ${theme.textAccent}`}>{guestName}</p>
                <p className="text-[10px] opacity-60">Di Tempat</p>
              </div>
            )}
          </div>

          {/* Open Button */}
          <div className="relative z-20 pb-8 animate-fade-in text-center">
            <button
              onClick={handleOpenInvitation}
              className={`px-8 py-3.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all duration-300 shadow-2xl flex items-center gap-2.5 mx-auto active:scale-95 ${theme.buttonPrimary}`}
            >
              <Mail className="w-4 h-4" />
              <span>Buka Undangan</span>
            </button>
            <p className="text-[10px] opacity-60 mt-3 font-medium">*Sentuh untuk membuka dan memutar alunan musik</p>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. FLOATING MUSIC CONTROLLER                             */}
      {/* ──────────────────────────────────────────────────────── */}
      {isOpenEnvelope && invitation.bgMusicUrl && (
        <button
          onClick={toggleMusic}
          className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border transition-transform active:scale-95 ${theme.cardBg} ${theme.cardBorder} ${theme.textAccent}`}
          title={isPlayingMusic ? "Jeda Musik" : "Putar Musik"}
        >
          {isPlayingMusic ? (
            <div className="relative flex items-center justify-center">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
          ) : (
            <VolumeX className="w-5 h-5 opacity-50" />
          )}
        </button>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 3. MAIN INVITATION CONTENT (Scrollable with Backdrop)     */}
      {/* ──────────────────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-5 py-12 space-y-20 relative z-10">
        {/* Section 1: Hero Cover */}
        <section className="text-center space-y-6 pt-4">
          <div className="space-y-2">
            <span className={`inline-block px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] ${theme.badge}`}>
              Walimatul 'Ursy
            </span>
            <p className="text-xs uppercase tracking-widest opacity-60 font-medium">
              {invitation.title || "The Wedding Of"}
            </p>
          </div>

          <div className="space-y-2">
            <h1 className={`text-4xl sm:text-5xl font-black ${theme.headingFont} tracking-tight`}>
              {invitation.groomNickName || "Mempelai Pria"}
            </h1>
            <p className={`text-2xl font-serif italic ${theme.textAccent}`}>&amp;</p>
            <h1 className={`text-4xl sm:text-5xl font-black ${theme.headingFont} tracking-tight`}>
              {invitation.brideNickName || "Mempelai Wanita"}
            </h1>
          </div>

          <p className="text-xs opacity-75 flex items-center justify-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {invitation.akadDate ? formatDateIndo(invitation.akadDate) : "Tanggal Bahagia"}
          </p>

          {/* Countdown Clock */}
          <div className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm max-w-sm mx-auto`}>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-3">Menghitung Hari</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Hari", val: timeLeft.days },
                { label: "Jam", val: timeLeft.hours },
                { label: "Menit", val: timeLeft.minutes },
                { label: "Detik", val: timeLeft.seconds },
              ].map((item, i) => (
                <div key={i} className="p-2.5 rounded-2xl bg-black/10 border border-white/5">
                  <span className={`block text-xl sm:text-2xl font-black tabular-nums ${theme.textAccent}`}>
                    {String(item.val).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Sacred Quote */}
        {invitation.openingQuote && (
          <section className="text-center space-y-4 px-4">
            <div className="w-8 h-px bg-amber-400/40 mx-auto" />
            <p className="text-xs leading-relaxed italic opacity-85 max-w-md mx-auto">
              "{invitation.openingQuote}"
            </p>
            {invitation.quoteSource && (
              <p className={`text-[11px] font-bold tracking-wider uppercase ${theme.textAccent}`}>
                — {invitation.quoteSource}
              </p>
            )}
            <div className="w-8 h-px bg-amber-400/40 mx-auto" />
          </section>
        )}

        {/* Section 3: Groom & Bride Profiles */}
        <section className="space-y-8">
          <div className="text-center space-y-1">
            <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Kedua Mempelai</h2>
            <p className="text-xs opacity-60">Dengan memohon rahmat dan ridho Allah SWT</p>
          </div>

          {/* Groom Card */}
          <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} text-center space-y-4 shadow-sm`}>
            {invitation.groomPhotoUrl ? (
              <img
                src={invitation.groomPhotoUrl}
                alt="Groom"
                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-amber-400/60 p-1 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-xl font-bold">
                👨
              </div>
            )}
            <div className="space-y-1">
              <h3 className={`text-lg font-bold ${theme.headingFont}`}>
                {invitation.groomFullName || "Mempelai Pria"}
              </h3>
              <p className="text-xs opacity-70">
                Putra dari {invitation.groomFather || "Bpk. Ayah"} &amp; {invitation.groomMother || "Ibu. Ibu"}
              </p>
            </div>
            {invitation.groomInstagram && (
              <a
                href={`https://instagram.com/${invitation.groomInstagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${theme.badge}`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{invitation.groomInstagram}</span>
              </a>
            )}
          </div>

          <div className="text-center">
            <span className={`text-xl font-serif italic ${theme.textAccent}`}>dengan</span>
          </div>

          {/* Bride Card */}
          <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} text-center space-y-4 shadow-sm`}>
            {invitation.bridePhotoUrl ? (
              <img
                src={invitation.bridePhotoUrl}
                alt="Bride"
                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-amber-400/60 p-1 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-xl font-bold">
                👩
              </div>
            )}
            <div className="space-y-1">
              <h3 className={`text-lg font-bold ${theme.headingFont}`}>
                {invitation.brideFullName || "Mempelai Wanita"}
              </h3>
              <p className="text-xs opacity-70">
                Putri dari {invitation.brideFather || "Bpk. Ayah"} &amp; {invitation.brideMother || "Ibu. Ibu"}
              </p>
            </div>
            {invitation.brideInstagram && (
              <a
                href={`https://instagram.com/${invitation.brideInstagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${theme.badge}`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{invitation.brideInstagram}</span>
              </a>
            )}
          </div>
        </section>

        {/* Section 4: Event Details (Akad & Resepsi) */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Rangkaian Acara</h2>
            <p className="text-xs opacity-60">Waktu &amp; Tempat Pelaksanaan</p>
          </div>

          {/* Akad */}
          <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                Akad Nikah
              </span>
              <Clock className="w-4 h-4 opacity-50" />
            </div>

            <div className="space-y-2">
              <h3 className={`text-lg font-bold ${theme.headingFont}`}>
                {invitation.akadDate ? formatDateIndo(invitation.akadDate) : "Tanggal Akad"}
              </h3>
              <p className="text-xs font-semibold flex items-center gap-2 opacity-80">
                <span>Pukul {invitation.akadStartTime || "08:00"} - {invitation.akadEndTime || "Selesai"} WIB</span>
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-white/5">
              <p className="text-xs font-bold text-slate-100">{invitation.akadVenueName || "Nama Tempat"}</p>
              <p className="text-xs opacity-70 leading-relaxed">{invitation.akadAddress || "Alamat lengkap"}</p>
            </div>

            {invitation.akadMapUrl && (
              <a href={invitation.akadMapUrl} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Petunjuk Arah Google Maps</span>
                </button>
              </a>
            )}
          </div>

          {/* Resepsi */}
          <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                Resepsi Pernikahan
              </span>
              <Clock className="w-4 h-4 opacity-50" />
            </div>

            <div className="space-y-2">
              <h3 className={`text-lg font-bold ${theme.headingFont}`}>
                {invitation.resepsiDate ? formatDateIndo(invitation.resepsiDate) : "Tanggal Resepsi"}
              </h3>
              <p className="text-xs font-semibold flex items-center gap-2 opacity-80">
                <span>Pukul {invitation.resepsiStartTime || "11:00"} - {invitation.resepsiEndTime || "Selesai"} WIB</span>
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-white/5">
              <p className="text-xs font-bold text-slate-100">{invitation.resepsiVenueName || "Nama Tempat"}</p>
              <p className="text-xs opacity-70 leading-relaxed">{invitation.resepsiAddress || "Alamat lengkap"}</p>
            </div>

            {invitation.resepsiMapUrl && (
              <a href={invitation.resepsiMapUrl} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Petunjuk Arah Google Maps</span>
                </button>
              </a>
            )}
          </div>
        </section>

        {/* Section 5: Love Story Timeline */}
        {loveStories.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Kisah Kasih Kami</h2>
              <p className="text-xs opacity-60">Sebuah perjalanan menuju ikatan suci</p>
            </div>

            <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-400/20">
              {loveStories.map((story, idx) => (
                <div key={idx} className="relative pl-12">
                  <span className="absolute left-4.5 top-1.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900" />
                  <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder}`}>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${theme.textAccent}`}>
                      {story.year}
                    </span>
                    <h4 className={`text-sm font-bold mt-0.5 ${theme.headingFont}`}>{story.title}</h4>
                    <p className="text-xs opacity-75 leading-relaxed mt-1">{story.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Photo Gallery */}
        {gallery.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Momen Bahagia</h2>
              <p className="text-xs opacity-60">Galeri kenangan perjalanan kami berdua</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {gallery.map((photo, idx) => (
                <div key={idx} className={`rounded-2xl overflow-hidden border ${theme.cardBorder} shadow-sm group`}>
                  <img
                    src={photo.url}
                    alt={photo.caption || "Gallery"}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {photo.caption && (
                    <p className="p-2 text-[10px] text-center opacity-70 truncate">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 7: Digital Gift / Amplop Digital */}
        {bankAccounts.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Tanda Kasih (Wedding Gift)</h2>
              <p className="text-xs opacity-60">
                Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih, Anda dapat menyalurkannya melalui:
              </p>
            </div>

            <div className="space-y-3">
              {bankAccounts.map((acc, idx) => (
                <div key={idx} className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                      {acc.bankName}
                    </span>
                    <Gift className="w-4 h-4 opacity-40" />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] opacity-60 uppercase tracking-wider">Nomor Rekening</p>
                    <p className={`text-xl font-bold font-mono tracking-wider ${theme.textAccent}`}>
                      {acc.accountNumber}
                    </p>
                    <p className="text-xs opacity-80">a.n {acc.accountHolder}</p>
                  </div>

                  <button
                    onClick={() => copyAccount(acc.accountNumber, idx)}
                    className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin ke Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nomor Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              ))}

              {invitation.giftAddress && (
                <div className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-2 shadow-sm text-center`}>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Alamat Kirim Kado Fisik</p>
                  <p className="text-xs opacity-80 leading-relaxed max-w-sm mx-auto">{invitation.giftAddress}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 8: RSVP & Buku Tamu */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Buku Tamu &amp; Doa Restu</h2>
            <p className="text-xs opacity-60">Sampaikan ucapan doa dan konfirmasi kehadiran Anda</p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!rsvpName.trim()) return toast.error("Silakan isi nama Anda!");
              rsvpMutation.mutate({
                guestName: rsvpName,
                attendanceStatus: attendance,
                guestCount: Number(guestCount),
                message,
              });
            }}
            className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-md`}
          >
            <div>
              <label className="block text-xs font-bold mb-1 opacity-80">Nama Anda</label>
              <input
                type="text"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border focus:outline-none ${theme.inputBg}`}
                placeholder="Tuliskan nama lengkap Anda"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 opacity-80">Konfirmasi Kehadiran</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "hadir", label: "Hadir" },
                  { id: "tidak_hadir", label: "Berhalangan" },
                  { id: "ragu", label: "Ragu-ragu" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAttendance(opt.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      attendance === opt.id
                        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-xs"
                        : "bg-black/10 border-white/10 hover:bg-black/20 opacity-70"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {attendance === "hadir" && (
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Jumlah Tamu</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border focus:outline-none ${theme.inputBg}`}
                >
                  <option value={1}>1 Orang</option>
                  <option value={2}>2 Orang</option>
                  <option value={3}>3 Orang</option>
                  <option value={4}>4 Orang</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1 opacity-80">Ucapan &amp; Doa Restu</label>
              <textarea
                rows={3}
                className={`w-full p-3.5 rounded-xl text-xs font-medium border focus:outline-none ${theme.inputBg}`}
                placeholder="Tuliskan doa restu untuk kedua mempelai..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={rsvpMutation.isPending}
              className={`w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${theme.buttonPrimary}`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{rsvpMutation.isPending ? "Mengirimkan..." : "Kirim Konfirmasi & Ucapan"}</span>
            </button>
          </form>

          {/* List of RSVPs / Guest Wishes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 text-center">
              Doa Restu dari Para Tamu ({rsvps.length})
            </h3>

            {rsvps.length === 0 ? (
              <p className="text-center text-xs opacity-50 py-4">Jadilah yang pertama memberikan doa restu!</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {rsvps.map((r) => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-1.5 shadow-xs`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold">{r.guestName}</h4>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        r.attendanceStatus === "hadir"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : r.attendanceStatus === "tidak_hadir"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {r.attendanceStatus === "hadir"
                          ? `Hadir (${r.guestCount} org)`
                          : r.attendanceStatus === "tidak_hadir"
                          ? "Berhalangan"
                          : "Ragu-ragu"}
                      </span>
                    </div>
                    {r.message && <p className="text-xs opacity-80 leading-relaxed font-serif italic">"{r.message}"</p>}
                    <p className="text-[9px] opacity-40 text-right">
                      {new Date(r.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center space-y-3 pt-12 pb-6 border-t border-white/5 opacity-75">
          <Heart className="w-5 h-5 text-rose-400 mx-auto fill-rose-400/30" />
          <p className={`text-sm font-bold ${theme.headingFont}`}>
            {invitation.groomNickName} &amp; {invitation.brideNickName}
          </p>
          <p className="text-[10px] tracking-wider uppercase opacity-50">
            Terima kasih atas doa restu Anda
          </p>
          <p className="text-[9px] opacity-40">
            Powered by WeddingPlan
          </p>
        </footer>
      </main>
    </div>
  );
};
