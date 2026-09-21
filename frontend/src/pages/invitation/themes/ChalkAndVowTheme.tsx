import React, { useState, useEffect } from "react";
import {
  Heart,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Music,
  Send,
  Gift,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Instagram,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Mail,
  CalendarPlus,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { DigitalInvitation, LoveStoryItem, GalleryPhotoItem, BankAccountItem, InvitationRsvp } from "../../../types/index.js";
import { formatDateIndo } from "../../../lib/utils.js";
import inveetChalkCover from "../../../assets/inveet-chalk-cover.webp";
import inveetChalkWhiteboard from "../../../assets/inveet-chalk-whiteboard.webp";

interface ChalkAndVowThemeProps {
  invitation: DigitalInvitation;
  guestName?: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlayingMusic: boolean;
  toggleMusic: () => void;
  onRsvpSubmit: (payload: any) => Promise<any>;
  isSubmittingRsvp: boolean;
}

export const ChalkAndVowTheme: React.FC<ChalkAndVowThemeProps> = ({
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
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Gallery Lightbox Modal State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // RSVP Form State
  const [rsvpName, setRsvpName] = useState(guestName);
  const [attendance, setAttendance] = useState<"hadir" | "tidak_hadir" | "ragu">("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");

  // Countdown timer logic
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

  // Handle Opening Invitation
  const handleOpen = () => {
    setIsOpenEnvelope(true);
    if (invitation.bgMusicUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Copy account helper
  const handleCopyAccount = (accNum: string, idx: number) => {
    navigator.clipboard.writeText(accNum);
    setCopiedIndex(idx);
    toast.success("Nomor rekening berhasil disalin!", { description: accNum });
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Copy gift address
  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    toast.success("Alamat berhasil disalin!", { description: addr });
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  // Google Calendar URL Generator
  const generateGoogleCalendarUrl = (title: string, dateStr?: string | null, startTime?: string | null, endTime?: string | null, location?: string | null) => {
    if (!dateStr) return "#";
    const dateFormatted = dateStr.split("T")[0].replace(/-/g, "");
    const sTime = (startTime || "08:00").replace(":", "") + "00";
    const eTime = (endTime || "12:00").replace(":", "") + "00";
    const startIso = `${dateFormatted}T${sTime}`;
    const endIso = `${dateFormatted}T${eTime}`;
    const desc = `Undangan Pernikahan ${invitation.groomNickName || "Mempelai"} & ${invitation.brideNickName || "Mempelai"}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(location || "")}`;
  };

  // Apple Calendar (.ics) Generator
  const downloadAppleCalendarIcs = (title: string, dateStr?: string | null, startTime?: string | null, endTime?: string | null, location?: string | null) => {
    if (!dateStr) return;
    const dateFormatted = dateStr.split("T")[0].replace(/-/g, "");
    const sTime = (startTime || "08:00").replace(":", "") + "00";
    const eTime = (endTime || "12:00").replace(":", "") + "00";
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Inveet Wedding//Chalk and Vow//ID",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${title}`,
      `DESCRIPTION:Pernikahan ${invitation.groomNickName} & ${invitation.brideNickName}`,
      `LOCATION:${location || ""}`,
      `DTSTART:${dateFormatted}T${sTime}`,
      `DTEND:${dateFormatted}T${eTime}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Kalender .ics berhasil diunduh!");
  };

  // Submit RSVP handler
  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      toast.error("Nama lengkap wajib diisi");
      return;
    }
    try {
      await onRsvpSubmit({
        guestName: rsvpName.trim(),
        attendanceStatus: attendance,
        guestCount,
        message: message.trim(),
      });
      setMessage("");
      toast.success("Konfirmasi & Doa Restu Terkirim!", {
        description: "Terima kasih banyak atas partisipasi dan ucapan tulus Anda.",
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengirim konfirmasi");
    }
  };

  return (
    <div className="min-h-screen bg-[#16241E] text-slate-800 antialiased selection:bg-rose-900/20 selection:text-[#8B2E3F]">
      <Toaster position="top-center" richColors />

      {/* Floating Audio Player Button (Fixed bottom-right) */}
      <div className="fixed bottom-6 right-6 md:right-8 z-40">
        <button
          onClick={toggleMusic}
          aria-label="Toggle Background Music"
          className="w-12 h-12 rounded-full bg-[#16241E] border border-[#C4A882]/40 text-[#C4A882] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group backdrop-blur-md"
        >
          <div className={`relative flex items-center justify-center ${isPlayingMusic ? "animate-spin" : ""}`} style={{ animationDuration: "5s" }}>
            <Music className="w-5 h-5" />
          </div>
          {isPlayingMusic && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-[#16241E] animate-pulse" />
          )}
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* DESKTOP SPLIT VIEWPORT ARCHITECTURE */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* DESKTOP SPLIT VIEWPORT ARCHITECTURE (SEAMLESS - ZERO GAP)   */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="min-h-screen flex justify-end bg-[#16241E]">
        {/* ======================================================== */}
        {/* 1. LEFT PANEL: FIXED CHALKBOARD HERO (Hidden on Mobile) */}
        {/* ======================================================== */}
        <aside className="hidden md:flex flex-1 fixed inset-y-0 left-0 right-[460px] lg:right-[480px] bg-[#16241E] text-[#F0EBE3] select-none overflow-hidden flex-col justify-between p-10 lg:p-14 border-r border-[#22352C] shadow-2xl z-20">
          {/* Official Inveet Chalk and Vow Background Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85 pointer-events-none"
            style={{ backgroundImage: `url(${inveetChalkCover})` }}
          />

          {/* Subtle dark ambient scrim gradient for readability */}
          <div className="absolute inset-0 bg-[#0F1C16]/35 pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-1">
            <span className="inline-block text-[11px] uppercase tracking-[0.28em] text-[#8CA68C] font-semibold">
              The Digital Wedding Invitation
            </span>
            <p className="text-xs text-[#C4A882]/80 tracking-widest uppercase font-serif">
              {invitation.title || "Chalk & Vow Edition"}
            </p>
          </div>

          {/* Middle Center Canvas (Typography Masterpiece) */}
          <div className="relative z-10 my-auto py-8 max-w-lg space-y-5 text-left">
            <div className="w-16 h-0.5 bg-[#C4A882]/40 rounded-full" />
            
            <span className="text-xs uppercase tracking-[0.3em] text-[#C4877A] font-bold">
              Walimatul 'Ursy
            </span>

            <div className="space-y-1.5">
              <h1 className="font-great-vibes text-5xl lg:text-6xl text-[#FAF8F5] leading-tight tracking-wide drop-shadow-md">
                {invitation.brideNickName || "Azalia Fasya"} &amp; {invitation.groomNickName || "Dias Taufik"}
              </h1>
              <p className="font-playfair text-lg text-[#C4A882] tracking-wider pt-1">
                {invitation.akadDate ? formatDateIndo(invitation.akadDate) : "Tanggal Bahagia"}
              </p>
            </div>

            {invitation.openingQuote && (
              <blockquote className="text-xs lg:text-sm text-[#E8DDD0]/80 italic leading-relaxed border-l-2 border-[#C4877A]/40 pl-4 max-w-md font-serif">
                "{invitation.openingQuote}"
                {invitation.quoteSource && (
                  <span className="block not-italic text-[11px] text-[#8CA68C] mt-2 font-sans tracking-wide">
                    — {invitation.quoteSource}
                  </span>
                )}
              </blockquote>
            )}
          </div>

          {/* Bottom Floating Identity Pill Card */}
          <div className="relative z-10 flex items-center justify-between pt-6 border-t border-[#2A3E34]/80">
            <div className="flex items-center gap-4 bg-[#0F1A15]/75 backdrop-blur-md px-6 py-3.5 rounded-full border border-[#C4A882]/30 shadow-lg">
              <span className="font-great-vibes text-2xl text-[#C4A882]">Pernikahan</span>
              <div className="w-px h-6 bg-[#2A3E34]" />
              <div className="text-left">
                <p className="font-playfair font-bold text-sm text-[#FAF8F5]">
                  {invitation.brideNickName || "Azalia"} &amp; {invitation.groomNickName || "Dias"}
                </p>
                <p className="text-[10px] tracking-wider text-[#8CA68C] uppercase font-mono">
                  {invitation.akadDate ? formatDateIndo(invitation.akadDate) : ""}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-[#8CA68C]/70 tracking-widest uppercase font-mono">
              Inveet • Chalk &amp; Vow
            </p>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* 2. RIGHT PANEL: SCROLLABLE MOBILE DEVICE CANVAS (480px)  */}
        {/* ======================================================== */}
        <main className="w-full md:w-[460px] lg:w-[480px] min-h-screen relative overflow-y-auto z-10 shadow-2xl md:border-l md:border-[#22352C] bg-[#FAF8F5] flex flex-col">
          {/* Mobile Container (Fills Right Panel Exactly - No Awkward Gaps) */}
          <div className="w-full min-h-screen bg-[#FAF8F5] relative flex flex-col">
            
            {/* ──────────────────────────────────────────────────── */}
            {/* COVER / OPENING ENVELOPE (Matches Reference 1:1)     */}
            {/* ──────────────────────────────────────────────────── */}
            {!isOpenEnvelope ? (
              <div className="min-h-screen relative flex flex-col justify-end p-6 sm:p-8 text-center text-[#FAF8F5] overflow-hidden select-none">
                {/* Pristine Official Inveet Chalk Art Botanical + Double Gold Frame Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100"
                  style={{ backgroundImage: `url(${inveetChalkCover})` }}
                />

                {/* Subtle dark ambient scrim gradient to guarantee text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1813]/85 via-transparent to-transparent pointer-events-none" />

                {/* Lower-Middle Typography Group (Matching Reference Screenshot 1:1) */}
                <div className="relative z-20 pb-6 sm:pb-8 space-y-4 max-w-sm mx-auto w-full">
                  {/* Eyebrow: PERNIKAHAN */}
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[#C4D0C5] font-semibold font-sans">
                    PERNIKAHAN
                  </p>

                  {/* Couple Names in Cursive Script (Bride & Groom) */}
                  <div className="space-y-0.5 py-0.5">
                    <h1 className="font-great-vibes text-4xl sm:text-5xl text-white drop-shadow-sm leading-tight">
                      {invitation.brideNickName || "Azalia Fasya"}
                    </h1>
                    <p className="font-playfair italic text-xs text-[#D4AF37] my-0.5">&amp;</p>
                    <h2 className="font-great-vibes text-4xl sm:text-5xl text-white drop-shadow-sm leading-tight">
                      {invitation.groomNickName || "Dias Taufik"}
                    </h2>
                  </div>

                  {/* Date with Flanking Horizontal Lines */}
                  <div className="flex items-center justify-center gap-3 text-white/90 py-1">
                    <div className="w-8 sm:w-10 h-px bg-white/40" />
                    <p className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.25em]">
                      {invitation.akadDate
                        ? formatDateIndo(invitation.akadDate).toUpperCase()
                        : "RABU, 30 SEPTEMBER 2026"}
                    </p>
                    <div className="w-8 sm:w-10 h-px bg-white/40" />
                  </div>

                  {/* Guest Personalization Box (If ?to= is present) */}
                  {guestName && (
                    <div className="py-2 px-4 rounded-full bg-[#12221A]/85 border border-[#C4A882]/35 shadow-lg backdrop-blur-md max-w-xs mx-auto text-center flex items-center justify-center gap-1.5 animate-fade-in">
                      <span className="text-[10px] text-[#A3B899] uppercase tracking-wider font-sans">
                        Kepada Yth:
                      </span>
                      <span className="text-xs font-bold font-playfair text-[#FAF8F5]">{guestName}</span>
                    </div>
                  )}

                  {/* Action Button: BUKA UNDANGAN (Pill Shape, Dark Green #1E342B, Mail Icon) */}
                  <div className="pt-2">
                    <button
                      onClick={handleOpen}
                      className="px-7 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-2xl flex items-center gap-2.5 mx-auto bg-[#1E342B] hover:bg-[#162720] text-white active:scale-95 border border-[#C4A882]/40 ring-1 ring-white/10"
                    >
                      <Mail className="w-4 h-4 text-white" />
                      <span>Buka Undangan</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (

              /* ──────────────────────────────────────────────────── */
              /* INVITATION CONTENT BODY (Scrollable Inside Phone Frame) */
              /* ──────────────────────────────────────────────────── */
              <div
                className="p-6 sm:p-8 space-y-14 animate-fade-in text-[#3D2B1F] bg-cover bg-top"
                style={{ backgroundImage: `url(${inveetChalkWhiteboard})` }}
              >
                
                {/* 1. HERO TOP SECTION */}
                <section className="text-center pt-8 space-y-4">
                  <span className="text-[11px] uppercase tracking-[0.28em] text-[#8CA68C] font-semibold">
                    The Wedding Of
                  </span>
                  <h2 className="font-great-vibes text-5xl text-[#8B2E3F] leading-snug">
                    {invitation.brideNickName || "Mempelai"} &amp; {invitation.groomNickName || "Mempelai"}
                  </h2>
                  <p className="font-playfair text-xs uppercase tracking-widest text-[#7A6E65]">
                    {invitation.akadDate ? formatDateIndo(invitation.akadDate) : ""}
                  </p>

                  {/* Hero Prewedding Image with rounded-3xl and ivory border */}
                  <div className="pt-2">
                    <div className="relative aspect-4/5 w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                      <img
                        src={coverImage}
                        alt="Couple Prewedding"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-4 inset-x-4 text-center text-white font-playfair text-sm italic">
                        {invitation.title || "The Beginning of Forever"}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. QUOTE / AYAT SUCI SECTION */}
                {invitation.openingQuote && (
                  <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs text-center space-y-4">
                    <div className="w-8 h-8 mx-auto rounded-full bg-rose-50 text-[#8B2E3F] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <blockquote className="font-playfair italic text-xs sm:text-sm text-[#5C4D44] leading-relaxed">
                      "{invitation.openingQuote}"
                    </blockquote>
                    {invitation.quoteSource && (
                      <p className="text-[11px] font-bold tracking-widest text-[#8CA68C] uppercase font-sans">
                        {invitation.quoteSource}
                      </p>
                    )}
                  </section>
                )}

                {/* 3. MEMPELAI (GROOM & BRIDE) SECTION */}
                <section className="space-y-8">
                  <div className="text-center space-y-1.5">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-[#8CA68C] font-semibold">
                      Pasangan Mempelai
                    </span>
                    <h3 className="font-playfair font-bold text-2xl sm:text-3xl text-[#16241E]">
                      Mempelai Bahagia
                    </h3>
                    <p className="text-xs text-[#7A6E65] max-w-xs mx-auto">
                      Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk merayakan ikatan suci kami:
                    </p>
                  </div>

                  {/* Groom Card */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs text-center space-y-4">
                    <div className="relative w-36 h-48 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-stone-100">
                      <img
                        src={invitation.groomPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"}
                        alt={invitation.groomFullName || "Mempelai Pria"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-great-vibes text-3xl text-[#8B2E3F]">
                        {invitation.groomNickName || "Mempelai Pria"}
                      </h4>
                      <p className="font-playfair font-bold text-base text-[#16241E] mt-0.5">
                        {invitation.groomFullName || "Nama Lengkap Mempelai Pria"}
                      </p>
                      {(invitation.groomFather || invitation.groomMother) && (
                        <p className="text-xs text-[#7A6E65] mt-1.5 leading-relaxed">
                          Putra dari {invitation.groomFather ? `Bpk. ${invitation.groomFather}` : ""}{" "}
                          {invitation.groomMother ? `& Ibu ${invitation.groomMother}` : ""}
                        </p>
                      )}
                      {invitation.groomInstagram && (
                        <a
                          href={`https://instagram.com/${invitation.groomInstagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#8B2E3F] hover:underline mt-2 font-medium"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>{invitation.groomInstagram}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Botanical Ampersand Divider */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-16 h-px bg-stone-300" />
                    <span className="font-great-vibes text-4xl text-[#C4877A]">&amp;</span>
                    <div className="w-16 h-px bg-stone-300" />
                  </div>

                  {/* Bride Card */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs text-center space-y-4">
                    <div className="relative w-36 h-48 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-stone-100">
                      <img
                        src={invitation.bridePhotoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"}
                        alt={invitation.brideFullName || "Mempelai Wanita"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-great-vibes text-3xl text-[#8B2E3F]">
                        {invitation.brideNickName || "Mempelai Wanita"}
                      </h4>
                      <p className="font-playfair font-bold text-base text-[#16241E] mt-0.5">
                        {invitation.brideFullName || "Nama Lengkap Mempelai Wanita"}
                      </p>
                      {(invitation.brideFather || invitation.brideMother) && (
                        <p className="text-xs text-[#7A6E65] mt-1.5 leading-relaxed">
                          Putri dari {invitation.brideFather ? `Bpk. ${invitation.brideFather}` : ""}{" "}
                          {invitation.brideMother ? `& Ibu ${invitation.brideMother}` : ""}
                        </p>
                      )}
                      {invitation.brideInstagram && (
                        <a
                          href={`https://instagram.com/${invitation.brideInstagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#8B2E3F] hover:underline mt-2 font-medium"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>{invitation.brideInstagram}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                {/* 4. COUNTDOWN & ACARA (AKAD & RESEPSI) */}
                <section className="space-y-8">
                  <div className="text-center space-y-1.5">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-[#8CA68C] font-semibold">
                      Jadwal Pernikahan
                    </span>
                    <h3 className="font-playfair font-bold text-2xl sm:text-3xl text-[#16241E]">
                      Hari Bahagia
                    </h3>
                  </div>

                  {/* Countdown Timer Block */}
                  <div className="grid grid-cols-4 gap-2.5 text-center">
                    {[
                      { label: "Hari", val: timeLeft.days },
                      { label: "Jam", val: timeLeft.hours },
                      { label: "Menit", val: timeLeft.minutes },
                      { label: "Detik", val: timeLeft.seconds },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs"
                      >
                        <p className="font-playfair font-bold text-2xl text-[#8B2E3F] leading-none">
                          {String(item.val).padStart(2, "0")}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-[#7A6E65] mt-1 font-semibold">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Akad Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4 text-center">
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-[#8B2E3F] border border-rose-200">
                      Akad Nikah
                    </div>
                    <h4 className="font-playfair font-bold text-xl text-[#16241E]">
                      {invitation.akadDate ? formatDateIndo(invitation.akadDate) : "Tanggal Akad"}
                    </h4>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-[#7A6E65]">
                      <Clock className="w-3.5 h-3.5 text-[#8B2E3F]" />
                      <span>
                        Pukul {invitation.akadStartTime || "08:00"} - {invitation.akadEndTime || "10:00"} WIB
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <p className="font-bold text-xs text-[#16241E]">
                        {invitation.akadVenueName || "Tempat Akad Nikah"}
                      </p>
                      <p className="text-xs text-[#7A6E65] leading-relaxed max-w-xs mx-auto">
                        {invitation.akadAddress || "Alamat lengkap lokasi akad"}
                      </p>
                    </div>

                    {/* Three Capsule Action Buttons */}
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                      {invitation.akadMapUrl && (
                        <a
                          href={invitation.akadMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#16241E] text-white hover:bg-[#22352C] transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <MapPin className="w-3 h-3 text-[#C4A882]" />
                          <span>Lihat Lokasi</span>
                        </a>
                      )}
                      
                      <a
                        href={generateGoogleCalendarUrl(
                          `Akad Nikah: ${invitation.groomNickName} & ${invitation.brideNickName}`,
                          invitation.akadDate,
                          invitation.akadStartTime,
                          invitation.akadEndTime,
                          invitation.akadVenueName
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-[#16241E] bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center gap-1.5"
                      >
                        <CalendarPlus className="w-3 h-3 text-[#8B2E3F]" />
                        <span>Google Cal</span>
                      </a>

                      <button
                        onClick={() =>
                          downloadAppleCalendarIcs(
                            `Akad Nikah: ${invitation.groomNickName} & ${invitation.brideNickName}`,
                            invitation.akadDate,
                            invitation.akadStartTime,
                            invitation.akadEndTime,
                            invitation.akadVenueName
                          )
                        }
                        className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-[#16241E] bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center gap-1.5"
                      >
                        <CalendarIcon className="w-3 h-3 text-[#8CA68C]" />
                        <span>Apple Cal</span>
                      </button>
                    </div>
                  </div>

                  {/* Resepsi Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4 text-center">
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Resepsi Pernikahan
                    </div>
                    <h4 className="font-playfair font-bold text-xl text-[#16241E]">
                      {invitation.resepsiDate ? formatDateIndo(invitation.resepsiDate) : "Tanggal Resepsi"}
                    </h4>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-[#7A6E65]">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Pukul {invitation.resepsiStartTime || "11:00"} - {invitation.resepsiEndTime || "14:00"} WIB
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <p className="font-bold text-xs text-[#16241E]">
                        {invitation.resepsiVenueName || "Tempat Resepsi Pernikahan"}
                      </p>
                      <p className="text-xs text-[#7A6E65] leading-relaxed max-w-xs mx-auto">
                        {invitation.resepsiAddress || "Alamat lengkap lokasi resepsi"}
                      </p>
                    </div>

                    {/* Three Capsule Action Buttons */}
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                      {invitation.resepsiMapUrl && (
                        <a
                          href={invitation.resepsiMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#16241E] text-white hover:bg-[#22352C] transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <MapPin className="w-3 h-3 text-[#C4A882]" />
                          <span>Lihat Lokasi</span>
                        </a>
                      )}
                      
                      <a
                        href={generateGoogleCalendarUrl(
                          `Resepsi: ${invitation.groomNickName} & ${invitation.brideNickName}`,
                          invitation.resepsiDate,
                          invitation.resepsiStartTime,
                          invitation.resepsiEndTime,
                          invitation.resepsiVenueName
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-[#16241E] bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center gap-1.5"
                      >
                        <CalendarPlus className="w-3 h-3 text-[#8B2E3F]" />
                        <span>Google Cal</span>
                      </a>

                      <button
                        onClick={() =>
                          downloadAppleCalendarIcs(
                            `Resepsi: ${invitation.groomNickName} & ${invitation.brideNickName}`,
                            invitation.resepsiDate,
                            invitation.resepsiStartTime,
                            invitation.resepsiEndTime,
                            invitation.resepsiVenueName
                          )
                        }
                        className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-[#16241E] bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center gap-1.5"
                      >
                        <CalendarIcon className="w-3 h-3 text-[#8CA68C]" />
                        <span>Apple Cal</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* 5. LOVE STORY SECTION (Inveet Signature Row Layout) */}
                {loveStories.length > 0 && (
                  <section className="space-y-8">
                    <div className="text-center space-y-1.5">
                      <span className="text-[11px] uppercase tracking-[0.25em] text-[#8CA68C] font-semibold">
                        Our Story
                      </span>
                      <h3 className="font-playfair font-bold text-2xl sm:text-3xl text-[#16241E]">
                        Kisah Cinta Kami
                      </h3>
                      <p className="text-xs text-[#7A6E65]">
                        Rangkaian kenangan indah yang mempertemukan kami
                      </p>
                    </div>

                    <div className="space-y-6">
                      {loveStories.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs relative overflow-hidden flex flex-col sm:flex-row gap-5 items-center sm:items-start"
                        >
                          {/* Translucent Giant Watermark Year on the Right */}
                          <div className="absolute top-2 right-4 font-playfair font-black text-6xl sm:text-7xl text-[#16241E]/5 select-none pointer-events-none">
                            {item.year}
                          </div>

                          {/* 3:4 Portrait Photo on the Left */}
                          <div className="w-28 h-36 shrink-0 rounded-2xl overflow-hidden shadow-sm border border-stone-100">
                            <img
                              src={
                                gallery[idx % gallery.length]?.url ||
                                coverImage
                              }
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Story Narrative on Right */}
                          <div className="flex-1 text-center sm:text-left space-y-2 z-10">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8CA68C]/15 text-[#375337] tracking-wider">
                              Tahun {item.year}
                            </span>
                            <h4 className="font-playfair font-bold text-base text-[#16241E]">
                              {item.title}
                            </h4>
                            <p className="text-xs text-[#5C4D44] leading-relaxed">
                              {item.story}
                            </p>
                            
                            {/* Chalk Foliage Heart Ornament */}
                            <div className="pt-2 flex items-center justify-center sm:justify-start gap-1.5 text-[#C4877A]/60">
                              <span className="text-xs">❦</span>
                              <div className="w-10 h-px bg-stone-200" />
                              <Heart className="w-3 h-3 fill-[#C4877A]" />
                              <div className="w-10 h-px bg-stone-200" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 6. PHOTO GALLERY (2-Column Grid + Lightbox Modal) */}
                {gallery.length > 0 && (
                  <section className="space-y-6">
                    <div className="text-center space-y-1.5">
                      <span className="text-[11px] uppercase tracking-[0.25em] text-[#8CA68C] font-semibold">
                        Gallery
                      </span>
                      <h3 className="font-playfair font-bold text-2xl sm:text-3xl text-[#16241E]">
                        Momen Bahagia
                      </h3>
                      <p className="text-xs text-[#7A6E65]">
                        Potret cinta dalam bingkai kebahagiaan
                      </p>
                    </div>

                    {/* Symmetric 2-Column Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {gallery.slice(0, 6).map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxIndex(idx)}
                          className="group relative aspect-4/5 rounded-2xl overflow-hidden cursor-pointer shadow-xs border-2 border-white hover:shadow-md transition-all duration-300"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || `Gallery ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white text-xs font-semibold">
                            Buka Foto
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expand Capsule Button */}
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setLightboxIndex(0)}
                        className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-stone-300 hover:bg-stone-50 text-[#16241E] shadow-xs transition-all active:scale-95"
                      >
                        Lihat Semua Foto ({gallery.length})
                      </button>
                    </div>
                  </section>
                )}

                {/* 7. LOVE GIFT / AMPLOP DIGITAL */}
                {(bankAccounts.length > 0 || invitation.giftAddress) && (
                  <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs text-center space-y-6">
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 mx-auto rounded-full bg-rose-50 text-[#8B2E3F] flex items-center justify-center">
                        <Gift className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.25em] text-[#8CA68C] font-semibold">
                        Tanda Kasih
                      </span>
                      <h3 className="font-playfair font-bold text-2xl text-[#16241E]">
                        Amplop Digital
                      </h3>
                      <p className="text-xs text-[#7A6E65] max-w-xs mx-auto">
                        Doa restu Anda merupakan karunia terindah bagi kami. Namun jika ingin memberikan tanda kasih:
                      </p>
                    </div>

                    {/* Bank Accounts */}
                    <div className="space-y-4">
                      {bankAccounts.map((acc, idx) => (
                        <div
                          key={idx}
                          className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/80 space-y-2 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider uppercase text-[#8B2E3F]">
                              {acc.bankName}
                            </span>
                            <span className="text-[10px] text-[#7A6E65] font-mono">Transfer Bank</span>
                          </div>
                          <p className="font-mono text-base font-bold text-[#16241E] tracking-wider">
                            {acc.accountNumber}
                          </p>
                          <p className="text-xs text-[#5C4D44]">a.n. {acc.accountHolder}</p>
                          <button
                            onClick={() => handleCopyAccount(acc.accountNumber, idx)}
                            className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-white border border-stone-200 hover:bg-stone-100 transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#8B2E3F]" />
                                <span>Salin No. Rekening</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Physical Gift Address */}
                    {invitation.giftAddress && (
                      <div className="pt-4 border-t border-stone-100 text-left space-y-2">
                        <p className="text-xs font-bold text-[#16241E] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#8B2E3F]" />
                          <span>Kirim Kado Fisik ke Alamat:</span>
                        </p>
                        <p className="text-xs text-[#5C4D44] bg-stone-50 p-3 rounded-xl border border-stone-200 leading-relaxed">
                          {invitation.giftAddress}
                        </p>
                        <button
                          onClick={() => handleCopyAddress(invitation.giftAddress!)}
                          className="text-[11px] font-semibold text-[#8B2E3F] hover:underline flex items-center gap-1"
                        >
                          {copiedAddress ? "Alamat Tersalin!" : "Salin Alamat Kado"}
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {/* 8. RSVP & UCAPAN BUKU TAMU */}
                <section className="space-y-6">
                  <div className="text-center space-y-1.5">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-[#8CA68C] font-semibold">
                      Konfirmasi &amp; Doa Restu
                    </span>
                    <h3 className="font-playfair font-bold text-2xl sm:text-3xl text-[#16241E]">
                      Buku Tamu Online
                    </h3>
                  </div>

                  {/* Form Card */}
                  <form
                    onSubmit={handleSubmitRsvp}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-[#16241E] mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#8B2E3F] transition-all"
                        placeholder="Nama Anda..."
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                      />
                    </div>

                    {/* Attendance Radio Pills */}
                    <div>
                      <label className="block text-xs font-bold text-[#16241E] mb-1.5">
                        Konfirmasi Kehadiran
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "hadir", label: "Hadir", icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
                          { id: "tidak_hadir", label: "Berhalangan", icon: XCircle, color: "text-rose-700 bg-rose-50 border-rose-300" },
                          { id: "ragu", label: "Masih Ragu", icon: HelpCircle, color: "text-amber-700 bg-amber-50 border-amber-300" },
                        ].map((tab) => {
                          const isSel = attendance === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setAttendance(tab.id as any)}
                              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center gap-1 ${
                                isSel ? tab.color + " ring-1 ring-[#8B2E3F]" : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"
                              }`}
                            >
                              <tab.icon className="w-4 h-4" />
                              <span className="text-[11px]">{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {attendance === "hadir" && (
                      <div>
                        <label className="block text-xs font-bold text-[#16241E] mb-1">
                          Jumlah Tamu Hadir
                        </label>
                        <select
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#8B2E3F]"
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                        >
                          <option value={1}>1 Orang Tamu</option>
                          <option value={2}>2 Orang Tamu</option>
                          <option value={3}>3 Orang Tamu</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-[#16241E] mb-1">
                        Doa Restu &amp; Pesan untuk Mempelai
                      </label>
                      <textarea
                        rows={3}
                        required
                        className="w-full p-3.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#8B2E3F] transition-all"
                        placeholder="Tuliskan ucapan selamat dan doa restu terbaik Anda..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRsvp}
                      className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8B2E3F] hover:bg-[#722332] text-white transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingRsvp ? (
                        <span>Mengirimkan...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Doa Restu</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Wishes List */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-bold text-[#16241E]">
                        Ucapan Terbaru ({rsvps.length})
                      </span>
                      <span className="text-[10px] text-[#8CA68C] uppercase font-semibold tracking-wider">
                        Live Wishes
                      </span>
                    </div>

                    {rsvps.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200/80 text-xs text-[#7A6E65]">
                        Belum ada ucapan doa. Jadilah yang pertama memberikan restu!
                      </div>
                    ) : (
                      rsvps.map((rsvp, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {/* Avatar with Sender Initial */}
                              <div className="w-8 h-8 rounded-full bg-[#16241E] text-[#C4A882] flex items-center justify-center text-xs font-bold font-serif shrink-0">
                                {rsvp.guestName?.charAt(0).toUpperCase() || "T"}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#16241E] leading-tight">
                                  {rsvp.guestName}
                                </p>
                                <span className="text-[10px] text-[#7A6E65]">
                                  {new Date(rsvp.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Attendance Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                rsvp.attendanceStatus === "hadir"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : rsvp.attendanceStatus === "tidak_hadir"
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {rsvp.attendanceStatus === "hadir" ? "Hadir" : rsvp.attendanceStatus === "tidak_hadir" ? "Berhalangan" : "Ragu"}
                            </span>
                          </div>

                          <p className="text-xs text-[#5C4D44] leading-relaxed pl-10">
                            {rsvp.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* 9. FOOTER SECTION */}
                <footer className="text-center pt-8 pb-12 space-y-3 border-t border-stone-200/80">
                  <h5 className="font-great-vibes text-4xl text-[#8B2E3F]">
                    {invitation.brideNickName || "Mempelai"} &amp; {invitation.groomNickName || "Mempelai"}
                  </h5>
                  <p className="text-xs text-[#7A6E65]">
                    Terima kasih atas segala doa restu yang Anda berikan.
                  </p>
                  <p className="text-[10px] text-[#8CA68C] tracking-widest uppercase font-mono pt-4">
                    Powered by Inveet • Wedding Platform
                  </p>
                </footer>

              </div>
            )}
          </div>
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. LIGHTBOX FULLSCREEN MODAL (Local State) */}
      {/* ────────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fade-in select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <span className="text-xs font-mono tracking-wider opacity-75">
              {lightboxIndex + 1} / {gallery.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Photo Display */}
          <div className="relative my-auto flex items-center justify-center max-h-[80vh] w-full">
            <img
              src={gallery[lightboxIndex].url}
              alt={gallery[lightboxIndex].caption || "Gallery Preview"}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            {gallery[lightboxIndex].caption && (
              <div className="absolute bottom-4 inset-x-0 text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs text-white">
                  {gallery[lightboxIndex].caption}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-center gap-4 text-white z-10 pb-4">
            <button
              onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};