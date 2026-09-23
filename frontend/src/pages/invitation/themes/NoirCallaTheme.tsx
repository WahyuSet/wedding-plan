import React, { useState, useEffect } from "react";
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Send,
  Gift,
  Copy,
  Check,
  Instagram,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { DigitalInvitation, LoveStoryItem, GalleryPhotoItem, BankAccountItem, InvitationRsvp } from "../../../types/index.js";
import { formatDateIndo } from "../../../lib/utils.js";
import { GoldDivider, CornerOrnament, MonogramFrame, CallaLilyAccent, StarField } from "./NoirCallaOrnaments.js";

interface NoirCallaThemeProps {
  invitation: DigitalInvitation;
  guestName?: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlayingMusic: boolean;
  toggleMusic: () => void;
  onRsvpSubmit: (payload: Record<string, unknown>) => Promise<unknown>;
  isSubmittingRsvp: boolean;
}

export const NoirCallaTheme: React.FC<NoirCallaThemeProps> = ({
  invitation,
  guestName = "",
  audioRef,
  isPlayingMusic,
  toggleMusic,
  onRsvpSubmit,
  isSubmittingRsvp,
}) => {
  const [isOpenEnvelope, setIsOpenEnvelope] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rsvpName, setRsvpName] = useState(guestName);
  const [attendance, setAttendance] = useState<"hadir" | "tidak_hadir" | "ragu">("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
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

  const loveStories: LoveStoryItem[] = Array.isArray(invitation.loveStory)
    ? invitation.loveStory
    : typeof invitation.loveStory === "string"
    ? JSON.parse(invitation.loveStory || "[]")
    : [];

  const gallery: GalleryPhotoItem[] = Array.isArray(invitation.galleryPhotos)
    ? invitation.galleryPhotos
    : typeof invitation.galleryPhotos === "string"
    ? JSON.parse(invitation.galleryPhotos || "[]")
    : [];

  const bankAccounts: BankAccountItem[] = Array.isArray(invitation.bankAccounts)
    ? invitation.bankAccounts
    : typeof invitation.bankAccounts === "string"
    ? JSON.parse(invitation.bankAccounts || "[]")
    : [];

  const rsvps: InvitationRsvp[] = invitation.rsvps || [];

  const coverImage =
    invitation.coverPhotoUrl ||
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&auto=format&fit=crop&q=85";

  const theme = {
    bg: "bg-[#080B11]",
    text: "text-slate-200",
    textMuted: "text-slate-300",
    textAccent: "text-[#D4AF37]",
    headingFont: "font-serif",
    cardBg: "bg-[#0F1420]/90 backdrop-blur-md",
    cardBorder: "border-[#D4AF37]/25",
    buttonPrimary: "bg-[#D4AF37] hover:bg-[#C59F2D] text-slate-950 font-bold",
    badge: "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20",
    bodyTexture: "linear-gradient(180deg, #080B11 0%, #0D1117 50%, #080B11 100%)",
    scrimOverlay: "bg-gradient-to-b from-[#080B11]/80 via-[#080B11]/50 to-[#080B11]/90",
  };

  const handleOpenInvitation = () => {
    setIsOpenEnvelope(true);
    if (invitation.bgMusicUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const copyAccount = (accNumber: string, idx: number) => {
    navigator.clipboard.writeText(accNumber);
    setCopiedIndex(idx);
    toast.success("Nomor Rekening Berhasil Disalin!", { description: accNumber });
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    if (!isOpenEnvelope) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            entry.target.classList.remove("opacity-0", "translate-y-6");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isOpenEnvelope]);

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      toast.error("Silakan isi nama Anda!");
      return;
    }
    onRsvpSubmit({
      guestName: rsvpName,
      attendanceStatus: attendance,
      guestCount: Number(guestCount),
      message,
    });
  };

  return (
    <div
      className={`min-h-[100dvh] ${theme.bg} ${theme.text} selection:bg-amber-400/30 transition-colors duration-500 relative overflow-x-hidden`}
      style={{ background: theme.bodyTexture }}
    >
      <Toaster position="top-center" richColors />

      {/* Star Field Background */}
      <StarField />

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. COVER / ENVELOPE OPENING SCREEN                       */}
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

          {/* Corner Ornaments */}
          <CornerOrnament position="tl" className="top-4 left-4 z-20" />
          <CornerOrnament position="tr" className="top-4 right-4 z-20" />
          <CornerOrnament position="bl" className="bottom-4 left-4 z-20" />
          <CornerOrnament position="br" className="bottom-4 right-4 z-20" />

          {/* Delicate Botanical Border Frame */}
          <div className="absolute inset-4 sm:inset-6 border border-[#D4AF37]/20 rounded-3xl pointer-events-none z-10" />

          {/* Top Header */}
          <div className="relative z-20 pt-8 space-y-2 animate-fade-in text-center">
            <span className={`inline-block px-3.5 py-1 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold ${theme.badge}`}>
              The Wedding Invitation
            </span>
            <p className={`text-xs tracking-widest uppercase font-medium ${theme.textMuted || "text-slate-300"}`}>
              {invitation.title || "The Wedding of"}
            </p>
          </div>

          {/* Couple Monogram / Names */}
          <div className="relative z-20 my-auto space-y-5 animate-scale-up max-w-md text-center">
            {/* Monogram Seal */}
            <MonogramFrame className="w-24 h-24 mx-auto">
              <span className={`text-3xl font-serif font-black ${theme.textAccent}`}>
                {invitation.groomNickName?.charAt(0) || "P"}&{invitation.brideNickName?.charAt(0) || "W"}
              </span>
            </MonogramFrame>

            <div className="space-y-1">
              <h1 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingFont} tracking-tight leading-tight`}>
                {invitation.groomNickName || "Mempelai Pria"} & {invitation.brideNickName || "Mempelai Wanita"}
              </h1>
              <p className={`text-xs font-medium ${theme.textMuted || "text-slate-300"}`}>
                {invitation.akadDate ? formatDateIndo(invitation.akadDate) : "Tanggal Bahagia"}
              </p>
            </div>

            {/* Guest Personalization Card */}
            {guestName && (
              <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xl space-y-1 max-w-xs mx-auto`}>
                <p className={`text-[11px] ${theme.textMuted || "text-slate-300"}`}>Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                <p className={`text-base font-extrabold font-serif ${theme.textAccent}`}>{guestName}</p>
                <p className={`text-[10px] ${theme.textMuted || "text-slate-300"} opacity-60`}>Di Tempat</p>
              </div>
            )}
          </div>

          {/* Open Button */}
          <div className="relative z-20 pb-8 animate-fade-in text-center">
            <button
              onClick={handleOpenInvitation}
              className={`px-8 py-3.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-2.5 mx-auto active:scale-95 ${theme.buttonPrimary}`}
            >
              <Mail className="w-4 h-4" />
              <span>Buka Undangan</span>
            </button>
            <p className={`text-[10px] mt-3 font-medium ${theme.textMuted || "text-slate-300"} opacity-60`}>*Sentuh untuk membuka dan memutar alunan musik</p>
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
      {/* 3. MAIN INVITATION CONTENT                                */}
      {/* ──────────────────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-4 sm:px-5 py-12 space-y-12 sm:space-y-16 relative z-10">

        {/* Section 1: Hero Cover */}
        <section className="text-center space-y-6 pt-4 opacity-0 translate-y-6" data-animate>
          <div className="flex justify-center">
            <CallaLilyAccent className="opacity-40" />
          </div>
          <div className="space-y-2">
            <span className={`inline-block px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] ${theme.badge}`}>
              Walimatul 'Ursy
            </span>
            <p className={`text-xs uppercase tracking-widest font-medium ${theme.textMuted || "text-slate-300"}`}>
              {invitation.title || "The Wedding Of"}
            </p>
          </div>

          <div className="space-y-2">
            <h1 className={`text-4xl sm:text-5xl font-black ${theme.headingFont} tracking-tight`}>
              {invitation.groomNickName || "Mempelai Pria"}
            </h1>
            <p className={`text-2xl font-serif italic ${theme.textAccent}`}>&</p>
            <h1 className={`text-4xl sm:text-5xl font-black ${theme.headingFont} tracking-tight`}>
              {invitation.brideNickName || "Mempelai Wanita"}
            </h1>
          </div>

          <GoldDivider />

          <p className={`text-xs flex items-center justify-center gap-1.5 font-medium ${theme.textMuted || "text-slate-300"}`}>
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            {invitation.akadDate ? formatDateIndo(invitation.akadDate) : "Tanggal Bahagia"}
          </p>

          {/* Countdown Clock */}
          <div className={`p-4 sm:p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-lg max-w-sm mx-auto`}>
            <p className={`text-[10px] uppercase font-bold tracking-widest mb-3 ${theme.textMuted || "text-slate-300"}`}>Menghitung Hari</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Hari", val: timeLeft.days },
                { label: "Jam", val: timeLeft.hours },
                { label: "Menit", val: timeLeft.minutes },
                { label: "Detik", val: timeLeft.seconds },
              ].map((item, i) => (
                <div key={i} className="p-2.5 rounded-2xl bg-black/20 border border-[#D4AF37]/10">
                  <span className={`block text-xl sm:text-2xl font-black tabular-nums ${theme.textAccent} drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]`}>
                    {String(item.val).padStart(2, "0")}
                  </span>
                  <span className={`text-[9px] uppercase tracking-wider ${theme.textMuted || "text-slate-300"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Sacred Quote */}
        {invitation.openingQuote && (
          <section className="text-center space-y-4 px-2 sm:px-4 opacity-0 translate-y-6" data-animate>
            <GoldDivider />
            <p className={`text-sm sm:text-base leading-relaxed italic max-w-md mx-auto ${theme.textMuted || "text-slate-300"}`}>
              "{invitation.openingQuote}"
            </p>
            {invitation.quoteSource && (
              <p className={`text-[11px] font-bold tracking-wider uppercase ${theme.textAccent}`}>
                — {invitation.quoteSource}
              </p>
            )}
            <GoldDivider />
          </section>
        )}

        {/* Section 3: Groom & Bride Profiles */}
        <section className="space-y-8 opacity-0 translate-y-6" data-animate>
          <div className="text-center space-y-2">
            <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Kedua Mempelai</h2>
            <p className={`text-xs ${theme.textMuted || "text-slate-300"}`}>Dengan memohon rahmat dan ridho Allah SWT</p>
            <GoldDivider className="mt-3" />
          </div>

          {/* Groom Card */}
          <div className={`p-4 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} text-center space-y-4 shadow-lg`}>
            {invitation.groomPhotoUrl ? (
              <img
                src={invitation.groomPhotoUrl}
                alt="Groom"
                className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-[#D4AF37]/60 p-1 shadow-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 flex items-center justify-center mx-auto">
                <span className="text-xl font-serif font-bold text-[#D4AF37]">{invitation.groomFullName?.charAt(0) || "P"}</span>
              </div>
            )}
            <div className="space-y-1">
              <h3 className={`text-lg font-bold ${theme.headingFont}`}>
                {invitation.groomFullName || "Mempelai Pria"}
              </h3>
              <p className={`text-xs ${theme.textMuted || "text-slate-300"} opacity-80`}>
                Putra dari {invitation.groomFather || "Bpk. Ayah"} & {invitation.groomMother || "Ibu. Ibu"}
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

          <div className="text-center flex items-center justify-center gap-3 py-2">
            <GoldDivider />
          </div>
          {/* Bride Card */}
          <div className={`p-4 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} text-center space-y-4 shadow-lg`}>
            {invitation.bridePhotoUrl ? (
              <img
                src={invitation.bridePhotoUrl}
                alt="Bride"
                className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-[#D4AF37]/60 p-1 shadow-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 flex items-center justify-center mx-auto">
                <span className="text-xl font-serif font-bold text-[#D4AF37]">{invitation.brideFullName?.charAt(0) || "W"}</span>
              </div>
            )}
            <div className="space-y-1">
              <h3 className={`text-lg font-bold ${theme.headingFont}`}>
                {invitation.brideFullName || "Mempelai Wanita"}
              </h3>
              <p className={`text-xs ${theme.textMuted || "text-slate-300"} opacity-80`}>
                Putri dari {invitation.brideFather || "Bpk. Ayah"} & {invitation.brideMother || "Ibu. Ibu"}
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
        <section className="space-y-6 opacity-0 translate-y-6" data-animate>
          <div className="text-center space-y-2">
            <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Rangkaian Acara</h2>
            <p className={`text-xs ${theme.textMuted || "text-slate-300"}`}>Waktu & Tempat Pelaksanaan</p>
            <GoldDivider className="mt-3" />
          </div>

          {/* Akad */}
          <div className={`p-4 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-lg`}>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                Akad Nikah
              </span>
              <Clock className="w-4 h-4 text-[#D4AF37]/70" />
            </div>

            <div className="space-y-2">
              <h3 className={`text-base sm:text-lg font-bold ${theme.headingFont}`}>
                {invitation.akadDate ? formatDateIndo(invitation.akadDate) : "Tanggal Akad"}
              </h3>
              <p className={`text-xs font-semibold flex items-center gap-2 ${theme.textMuted || "text-slate-300"}`}>
                <span>Pukul {invitation.akadStartTime || "08:00"} - {invitation.akadEndTime || "Selesai"} WIB</span>
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-[#D4AF37]/15">
              <p className="text-xs font-bold text-slate-100">{invitation.akadVenueName || "Nama Tempat"}</p>
              <p className={`text-xs leading-relaxed ${theme.textMuted || "text-slate-300"}`}>{invitation.akadAddress || "Alamat lengkap"}</p>
            </div>

            {invitation.akadMapUrl && (
              <a href={invitation.akadMapUrl} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Petunjuk Arah Google Maps</span>
                </button>
              </a>
            )}
          </div>

          {/* Resepsi */}
          <div className={`p-4 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-lg`}>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                Resepsi Pernikahan
              </span>
              <Clock className="w-4 h-4 text-[#D4AF37]/70" />
            </div>

            <div className="space-y-2">
              <h3 className={`text-base sm:text-lg font-bold ${theme.headingFont}`}>
                {invitation.resepsiDate ? formatDateIndo(invitation.resepsiDate) : "Tanggal Resepsi"}
              </h3>
              <p className={`text-xs font-semibold flex items-center gap-2 ${theme.textMuted || "text-slate-300"}`}>
                <span>Pukul {invitation.resepsiStartTime || "11:00"} - {invitation.resepsiEndTime || "Selesai"} WIB</span>
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-[#D4AF37]/15">
              <p className="text-xs font-bold text-slate-100">{invitation.resepsiVenueName || "Nama Tempat"}</p>
              <p className={`text-xs leading-relaxed ${theme.textMuted || "text-slate-300"}`}>{invitation.resepsiAddress || "Alamat lengkap"}</p>
            </div>

            {invitation.resepsiMapUrl && (
              <a href={invitation.resepsiMapUrl} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Petunjuk Arah Google Maps</span>
                </button>
              </a>
            )}
          </div>
        </section>

        {/* Section 5: Love Story Timeline */}
        {loveStories.length > 0 && (
          <section className="space-y-6 opacity-0 translate-y-6" data-animate>
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Kisah Kasih Kami</h2>
              <p className={`text-xs ${theme.textMuted || "text-slate-300"}`}>Sebuah perjalanan menuju ikatan suci</p>
              <GoldDivider className="mt-3" />
            </div>

            <div className="space-y-4 relative before:absolute before:left-4 sm:before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-[#D4AF37]/20">
              {loveStories.map((story, idx) => (
                <div key={idx} className="relative pl-10 sm:pl-14">
                  <span className="absolute left-[18px] sm:left-[22px] top-2 w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#080B11] shadow-sm shadow-[#D4AF37]/30" />
                  <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} border-l-2 border-l-[#D4AF37]/40`}>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${theme.textAccent}`}>
                      {story.year}
                    </span>
                    <h4 className={`text-sm font-bold mt-0.5 ${theme.headingFont}`}>{story.title}</h4>
                    <p className={`text-xs leading-relaxed mt-1 ${theme.textMuted || "text-slate-300"}`}>{story.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Photo Gallery */}
        {gallery.length > 0 && (
          <section className="space-y-6 opacity-0 translate-y-6" data-animate>
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Momen Bahagia</h2>
              <p className={`text-xs ${theme.textMuted || "text-slate-300"}`}>Galeri kenangan perjalanan kami berdua</p>
              <GoldDivider className="mt-3" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {gallery.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`rounded-2xl overflow-hidden border ${theme.cardBorder} shadow-sm group aspect-square cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-transform duration-300 hover:scale-[1.02]`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || "Gallery"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Lightbox */}
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.max(0, lightboxIndex - 1)); }}
              className="absolute left-2 sm:left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30 z-10"
              disabled={lightboxIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <img
              src={gallery[lightboxIndex].url}
              alt={gallery[lightboxIndex].caption || "Gallery"}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(gallery.length - 1, lightboxIndex + 1)); }}
              className="absolute right-2 sm:right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30 z-10"
              disabled={lightboxIndex === gallery.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {gallery[lightboxIndex].caption && (
              <p className="absolute bottom-6 text-[11px] sm:text-sm text-white/80 text-center max-w-md px-2.5">{gallery[lightboxIndex].caption}</p>
            )}
          </div>
        )}

        {/* Section 7: Digital Gift / Amplop Digital */}
        {bankAccounts.length > 0 && (
          <section className="space-y-6 opacity-0 translate-y-6" data-animate>
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Tanda Kasih (Wedding Gift)</h2>
              <p className={`text-xs ${theme.textMuted || "text-slate-300"} max-w-sm mx-auto`}>
                Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih, Anda dapat menyalurkannya melalui:
              </p>
              <GoldDivider className="mt-3" />
            </div>

            <div className="space-y-3">
              {bankAccounts.map((acc, idx) => (
                <div key={idx} className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                      {acc.bankName}
                    </span>
                    <Gift className="w-4 h-4 text-[#D4AF37]/60" />
                  </div>

                  <div className="space-y-0.5">
                    <p className={`text-[10px] uppercase tracking-wider ${theme.textMuted || "text-slate-300"}`}>Nomor Rekening</p>
                    <p className={`text-lg sm:text-xl font-bold font-mono tracking-widest break-all ${theme.textAccent}`}>
                      {acc.accountNumber}
                    </p>
                    <p className={`text-xs ${theme.textMuted || "text-slate-300"}`}>a.n {acc.accountHolder}</p>
                  </div>

                  <button
                    onClick={() => copyAccount(acc.accountNumber, idx)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-colors ${copiedIndex === idx ? "border-emerald-500/40 bg-emerald-500/10" : "border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"}`}
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin ke Clipboard</span>
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
                <div className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-2 shadow-lg text-center`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${theme.textMuted || "text-slate-300"}`}>Alamat Kirim Kado Fisik</p>
                  <p className={`text-xs leading-relaxed max-w-sm mx-auto ${theme.textMuted || "text-slate-300"}`}>{invitation.giftAddress}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 8: RSVP & Buku Tamu */}
        <section className="space-y-6 opacity-0 translate-y-6" data-animate>
          <div className="text-center space-y-2">
            <h2 className={`text-2xl font-bold ${theme.headingFont}`}>Buku Tamu & Doa Restu</h2>
            <p className={`text-xs ${theme.textMuted || "text-slate-300"}`}>Sampaikan ucapan doa dan konfirmasi kehadiran Anda</p>
            <GoldDivider className="mt-3" />
          </div>

          {/* Form */}
          <form
            onSubmit={handleRsvpSubmit}
            className={`p-4 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-5 shadow-lg`}
          >
            <div>
              <label className={`block text-xs font-bold mb-2 ${theme.textMuted || "text-slate-300"}`}>Nama Anda</label>
              <input
                type="text"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border bg-[#0A0E17] border-[#D4AF37]/20 focus:border-[#D4AF37]/50 text-slate-200 placeholder-slate-400/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40`}
                placeholder="Tuliskan nama lengkap Anda"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 ${theme.textMuted || "text-slate-300"}`}>Konfirmasi Kehadiran</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "hadir", label: "Hadir" },
                  { id: "tidak_hadir", label: "Berhalangan" },
                  { id: "ragu", label: "Ragu-ragu" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAttendance(opt.id as "hadir" | "tidak_hadir" | "ragu")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      attendance === opt.id
                        ? "bg-[#D4AF37] text-[#080B11] border-[#D4AF37] shadow-md"
                        : "bg-black/20 border-[#D4AF37]/15 hover:bg-black/30 text-white/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {attendance === "hadir" && (
              <div>
                <label className={`block text-xs font-bold mb-2 ${theme.textMuted || "text-slate-300"}`}>Jumlah Tamu</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border bg-[#0A0E17] border-[#D4AF37]/20 focus:border-[#D4AF37]/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40`}
                >
                  <option value={1}>1 Orang</option>
                  <option value={2}>2 Orang</option>
                  <option value={3}>3 Orang</option>
                  <option value={4}>4 Orang</option>
                </select>
              </div>
            )}

            <div>
              <label className={`block text-xs font-bold mb-2 ${theme.textMuted || "text-slate-300"}`}>Ucapan & Doa Restu</label>
              <textarea
                rows={3}
                className={`w-full p-3.5 rounded-xl text-xs font-medium border bg-[#0A0E17] border-[#D4AF37]/20 focus:border-[#D4AF37]/50 text-slate-200 placeholder-slate-400/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40`}
                placeholder="Tuliskan doa restu untuk kedua mempelai..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingRsvp}
              className={`w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${theme.buttonPrimary} disabled:opacity-50`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingRsvp ? "Mengirimkan..." : "Kirim Konfirmasi & Ucapan"}</span>
            </button>
          </form>

          {/* List of RSVPs / Guest Wishes */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider text-center ${theme.textMuted || "text-slate-300"}`}>
              Doa Restu dari Para Tamu ({rsvps.length})
            </h3>

            {rsvps.length === 0 ? (
              <p className={`text-center text-xs py-4 ${theme.textMuted || "text-slate-300"} opacity-70`}>Jadilah yang pertama memberikan doa restu!</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                {rsvps.map((r) => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-1.5 shadow-sm`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-100 truncate">{r.guestName}</h4>
                      <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold ${
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
                    {r.message && <p className={`text-xs leading-relaxed font-serif italic ${theme.textMuted || "text-slate-300"}`}>"{r.message}"</p>}
                    <p className={`text-[9px] text-right ${theme.textMuted || "text-slate-300"} opacity-70`}>
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
        <footer className="text-center space-y-3 pt-12 pb-6 border-t border-[#D4AF37]/15 opacity-0 translate-y-6 relative" data-animate>
          <CallaLilyAccent className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 opacity-20 rotate-180" />
          <Heart className="w-5 h-5 text-[#D4AF37] mx-auto fill-[#D4AF37]/30" />
          <p className={`text-sm font-bold ${theme.headingFont}`}>
            {invitation.groomNickName} & {invitation.brideNickName}
          </p>
          <p className={`text-[10px] tracking-wider uppercase ${theme.textMuted || "text-slate-300"} opacity-60`}>
            Terima kasih atas doa restu Anda
          </p>
          <p className={`text-[9px] ${theme.textMuted || "text-slate-300"} opacity-30`}>
            Powered by WeddingPlan
          </p>
        </footer>
      </main>
    </div>
  );
};
