import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ExternalLink,
  Save,
  Check,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Music,
  Calendar,
  Heart,
  CreditCard,
  MessageSquare,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import {
  type DigitalInvitation,
  type ApiResponse,
  type LoveStoryItem,
  type GalleryPhotoItem,
  type BankAccountItem,
} from "../types/index.js";
import { Topbar } from "../components/layout/Topbar.js";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { Badge } from "../components/ui/Badge.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { ImagePresetModal } from "../components/invitation/ImagePresetModal.js";
import { GuestManager } from "../components/invitation/GuestManager.js";
import { FileUploadButton } from "../components/invitation/FileUploadButton.js";
import { UploadManager } from "../components/invitation/UploadManager.js";
import { InvitationPreviewPanel } from "../components/invitation/InvitationPreviewPanel.js";
import { buildDraftInvitation } from "./invitation/previewDraft.js";
import { INVITATION_THEMES } from "../lib/invitationThemes.js";
import { withoutSchemaDefaultPhoto } from "../lib/invitationDefaults.js";
import { publicInvitationUrl, shareInvitationUrl } from "../lib/invitationLinks.js";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { DEFAULT_QUOTES } from "./invitation/shared/invitationCopy.js";

const DEFAULT_COVER_URL =
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80";
const PLACEHOLDER_ACCOUNT = "1234567890";

const ToggleRow: React.FC<{
  label: string;
  description: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}> = ({ label, description, inputProps }) => (
  <label className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white cursor-pointer">
    <span className="space-y-0.5">
      <span className="block text-sm font-bold text-slate-900">{label}</span>
      <span className="block text-xs text-slate-500 leading-relaxed">{description}</span>
    </span>
    <span className="relative shrink-0 mt-0.5">
      <input type="checkbox" className="peer sr-only" {...inputProps} />
      <span className="block w-11 h-6 rounded-full bg-slate-300 transition-colors peer-checked:bg-[#E11D48] peer-focus-visible:ring-2 peer-focus-visible:ring-[#E11D48]/40 peer-focus-visible:ring-offset-2" />
      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </span>
  </label>
);

export const InvitationAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"theme" | "event" | "story" | "gift" | "rsvps">("theme");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Image Preset Picker Modal State
  const [modalPickerConfig, setModalPickerConfig] = useState<{
    isOpen: boolean;
    title: string;
    category: "cover" | "groom" | "bride" | "gallery";
    targetField?: "coverPhotoUrl" | "heroPhotoUrl" | "groomPhotoUrl" | "bridePhotoUrl" | "gallery";
    galleryIndex?: number;
  }>({
    isOpen: false,
    title: "",
    category: "cover",
  });

  // Fetch invitation configuration
  const { data, isLoading } = useQuery<ApiResponse<DigitalInvitation>>({
    queryKey: ["digital-invitation-config"],
    queryFn: async () => {
      const res = await api.get("/invitation/config");
      return res.data;
    },
  });

  const invitation = data?.data;

  // React Hook Form
  const { register, handleSubmit, setValue, watch, reset } = useForm<any>({
    defaultValues: {
      slug: "",
      theme: "noir-calla",
      title: "The Wedding of",
      tone: "islami",
      timezone: "WIB",
      openingQuote: "",
      quoteSource: "",
      bgMusicUrl: "",
      isMusicAutoPlay: true,
      isPublished: true,

      coverPhotoUrl: "",
      heroPhotoUrl: "",

      groomFullName: "",
      groomNickName: "",
      groomFather: "",
      groomMother: "",
      groomInstagram: "",
      groomPhotoUrl: "",

      brideFullName: "",
      brideNickName: "",
      brideFather: "",
      brideMother: "",
      brideInstagram: "",
      bridePhotoUrl: "",

      akadDate: "",
      akadStartTime: "08:00",
      akadEndTime: "10:00",
      akadVenueName: "",
      akadAddress: "",
      akadMapUrl: "",

      resepsiDate: "",
      resepsiStartTime: "11:00",
      resepsiEndTime: "14:00",
      resepsiVenueName: "",
      resepsiAddress: "",
      resepsiMapUrl: "",

      giftAddress: "",
    },
  });

  // Keep state for loveStory, gallery, and bank accounts
  const [loveStoryList, setLoveStoryList] = useState<LoveStoryItem[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryPhotoItem[]>([]);
  const [bankList, setBankList] = useState<BankAccountItem[]>([]);

  // Synchronize form when data is loaded
  React.useEffect(() => {
    if (invitation) {
      reset({
        slug: invitation.slug || "",
        theme: invitation.theme || "noir-calla",
        title: invitation.title || "The Wedding of",
        tone: invitation.tone || "islami",
        timezone: invitation.timezone || "WIB",
        openingQuote: invitation.openingQuote || "",
        quoteSource: invitation.quoteSource || "",
        bgMusicUrl: invitation.bgMusicUrl || "",
        isMusicAutoPlay: invitation.isMusicAutoPlay ?? true,
        isPublished: invitation.isPublished ?? true,

        // Foto tidak pernah diisi otomatis: foto contoh yang ikut tersimpan akan tampil ke tamu sebagai foto pasangan.
        coverPhotoUrl: withoutSchemaDefaultPhoto(invitation.coverPhotoUrl) ?? "",
        heroPhotoUrl: withoutSchemaDefaultPhoto(invitation.heroPhotoUrl) ?? "",

        groomFullName: invitation.groomFullName || "",
        groomNickName: invitation.groomNickName || "",
        groomFather: invitation.groomFather || "",
        groomMother: invitation.groomMother || "",
        groomInstagram: invitation.groomInstagram || "",
        groomPhotoUrl: invitation.groomPhotoUrl || "",

        brideFullName: invitation.brideFullName || "",
        brideNickName: invitation.brideNickName || "",
        brideFather: invitation.brideFather || "",
        brideMother: invitation.brideMother || "",
        brideInstagram: invitation.brideInstagram || "",
        bridePhotoUrl: invitation.bridePhotoUrl || "",

        akadDate: invitation.akadDate ? invitation.akadDate.split("T")[0] : "",
        akadStartTime: invitation.akadStartTime || "08:00",
        akadEndTime: invitation.akadEndTime || "10:00",
        akadVenueName: invitation.akadVenueName || "",
        akadAddress: invitation.akadAddress || "",
        akadMapUrl: invitation.akadMapUrl || "",

        resepsiDate: invitation.resepsiDate ? invitation.resepsiDate.split("T")[0] : "",
        resepsiStartTime: invitation.resepsiStartTime || "11:00",
        resepsiEndTime: invitation.resepsiEndTime || "14:00",
        resepsiVenueName: invitation.resepsiVenueName || "",
        resepsiAddress: invitation.resepsiAddress || "",
        resepsiMapUrl: invitation.resepsiMapUrl || "",

        giftAddress: invitation.giftAddress || "",
      });

      // Parse JSON arrays
      try {
        if (typeof invitation.loveStory === "string") {
          setLoveStoryList(JSON.parse(invitation.loveStory));
        } else if (Array.isArray(invitation.loveStory)) {
          setLoveStoryList(invitation.loveStory);
        }
      } catch (_) {
        setLoveStoryList([]);
      }

      try {
        if (typeof invitation.galleryPhotos === "string") {
          setGalleryList(JSON.parse(invitation.galleryPhotos));
        } else if (Array.isArray(invitation.galleryPhotos)) {
          setGalleryList(invitation.galleryPhotos);
        }
      } catch (_) {
        setGalleryList([]);
      }

      try {
        if (typeof invitation.bankAccounts === "string") {
          setBankList(JSON.parse(invitation.bankAccounts));
        } else if (Array.isArray(invitation.bankAccounts)) {
          setBankList(invitation.bankAccounts);
        }
      } catch (_) {
        setBankList([]);
      }
    }
  }, [invitation, reset]);

  // Mutation to save config
  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      const payload = {
        ...formData,
        loveStory: loveStoryList,
        galleryPhotos: galleryList,
        bankAccounts: bankList,
      };
      const res = await api.put("/invitation/config", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digital-invitation-config"] });
      toast.success("Pengaturan Undangan Tersimpan! ✨", {
        description: "Perubahan telah langsung diperbarui di undangan publik.",
      });
    },
    onError: (err: any) => {
      toast.error("Gagal Menyimpan", {
        description: err.response?.data?.message || "Terjadi kesalahan saat menyimpan pengaturan.",
      });
    },
  });

  const selectedTheme = watch("theme") || "noir-calla";
  const currentSlug = watch("slug") || invitation?.slug || "wedding";
  const coverPhoto = watch("coverPhotoUrl");
  const heroPhoto = watch("heroPhotoUrl");
  const groomPhoto = watch("groomPhotoUrl");
  const bridePhoto = watch("bridePhotoUrl");

  const { settings } = usePublicSettings();
  const publicUrl = publicInvitationUrl(currentSlug, null, settings.invitation_url);
  const shareUrl = shareInvitationUrl(currentSlug, null, settings.invitation_url);

  // Tautan yang sudah beredar memuat slug lama, jadi menggantinya mematikan tautan itu.
  const savedSlug = invitation?.slug || "";
  const guestLinkExample = publicInvitationUrl(
    savedSlug || "nama-pilihan",
    "nama-tamu-kode",
    settings.invitation_url
  ).replace(/^https?:\/\//, "");
  const slugChanged = Boolean(savedSlug) && currentSlug.trim().toLowerCase() !== savedSlug;
  const linksAlreadyShared = Boolean(invitation?.isPublished) || Boolean(invitation?.guests?.some((g) => g.isSent));
  const slugWarning =
    slugChanged && linksAlreadyShared
      ? "Mengubah tautan akan mematikan semua link yang sudah dibagikan ke tamu."
      : undefined;

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Tautan Berhasil Disalin!", { description: shareUrl });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const watched = watch();
  const checklist = [
    { ok: Boolean(watched.groomFullName && watched.brideFullName), label: "Nama lengkap kedua mempelai" },
    { ok: Boolean(watched.akadDate), label: "Tanggal akad" },
    { ok: Boolean(watched.akadVenueName && watched.akadAddress), label: "Nama tempat dan alamat akad" },
    {
      ok: Boolean(watched.coverPhotoUrl) && watched.coverPhotoUrl !== DEFAULT_COVER_URL,
      label: "Foto sampul pilihan sendiri (bukan foto bawaan)",
    },
    {
      ok: bankList.every((b) => b.accountNumber && b.accountNumber !== PLACEHOLDER_ACCOUNT),
      label: "Data rekening bukan contoh (kosongkan jika tidak dipakai)",
    },
  ];

  const draft = invitation
    ? buildDraftInvitation({
        base: invitation,
        values: watched,
        loveStory: loveStoryList,
        gallery: galleryList,
        bankAccounts: bankList,
      })
    : null;

  const handleToneChange = (tone: "islami" | "umum") => {
    const current = (watched.openingQuote || "").trim();
    const other = tone === "islami" ? DEFAULT_QUOTES.umum : DEFAULT_QUOTES.islami;
    // Ganti kutipan hanya jika masih kutipan bawaan atau kosong; kutipan buatan sendiri tidak disentuh.
    if (!current || current === other.text) {
      setValue("openingQuote", DEFAULT_QUOTES[tone].text);
      setValue("quoteSource", DEFAULT_QUOTES[tone].source);
    }
  };

  const handlePresetSelect = (url: string) => {
    if (modalPickerConfig.targetField === "gallery") {
      if (modalPickerConfig.galleryIndex !== undefined) {
        const updated = [...galleryList];
        updated[modalPickerConfig.galleryIndex].url = url;
        setGalleryList(updated);
      } else {
        setGalleryList([...galleryList, { url, caption: "" }]);
      }
    } else if (modalPickerConfig.targetField) {
      setValue(modalPickerConfig.targetField, url);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={100} rounded="2xl" />
        <Skeleton height={350} rounded="2xl" />
      </div>
    );
  }

  const rsvps = invitation?.rsvps || [];

  const attendingCount = rsvps.filter((r) => r.attendanceStatus === "hadir").length;
  const totalGuestsComing = rsvps
    .filter((r) => r.attendanceStatus === "hadir")
    .reduce((acc, curr) => acc + (curr.guestCount || 1), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Topbar */}
      <Topbar
        title="Undangan Pernikahan Digital"
        description="Kelola tema, foto, detail acara, amplop digital, dan buku tamu online"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={showPreview ? "secondary" : "outline"}
              size="sm"
              leftIcon={<Eye className="w-4 h-4" />}
              onClick={() => setShowPreview((v) => !v)}
              aria-pressed={showPreview}
            >
              Pratinjau
            </Button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>
                Buka Undangan
              </Button>
            </a>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={saveMutation.isPending}
              onClick={handleSubmit((data) => saveMutation.mutate(data))}
            >
              Simpan Pengaturan
            </Button>
          </div>
        }
      />

      {/* 1. Quick Info & Share Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${invitation?.isPublished ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {invitation?.isPublished ? "Tautan Undangan Publik Aktif" : "Undangan Belum Dipublikasikan"}
            </span>
            <Badge variant="neutral" size="sm" className="bg-white/10 text-white border-0">
              Tema: {INVITATION_THEMES.find((t) => t.id === selectedTheme)?.name}
            </Badge>
          </div>
          <p className="text-sm md:text-base font-bold text-slate-100 font-mono break-all">
            {shareUrl}
          </p>
          <p className="text-xs text-slate-400">
            {rsvps.length} Ucapan Masuk • {attendingCount} Konfirmasi Hadir ({totalGuestsComing} Orang Tamu)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={copyPublicUrl}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          >
            {copiedLink ? "Tersalin!" : "Salin Link"}
          </Button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>
              Buka di Tab Baru
            </Button>
          </a>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {[
          { id: "theme", label: "1. Tema & Gambar Master", icon: Sparkles },
          { id: "event", label: "2. Mempelai & Acara", icon: Calendar },
          { id: "story", label: "3. Cerita & Galeri", icon: Heart },
          { id: "gift", label: "4. Amplop Digital", icon: CreditCard },
          { id: "rsvps", label: `5. Tamu & RSVP (${rsvps.length})`, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-6">
        {/* ──────────────── TAB 1: TEMA & GAMBAR MASTER ──────────────── */}
        {activeTab === "theme" && (
          <div className="space-y-6">
            {/* Publikasi & Pengaturan Umum */}
            <Card className="p-6 space-y-4">
              <div>
                <CardTitle>Publikasi &amp; Pengaturan Umum</CardTitle>
                <CardDescription>
                  Undangan baru tidak terlihat oleh tamu sampai Anda mempublikasikannya.
                </CardDescription>
              </div>

              <ToggleRow
                label="Publikasikan undangan"
                description="Jika aktif, siapa pun yang memiliki tautan dapat membuka undangan dan mengirim RSVP."
                inputProps={register("isPublished")}
              />
              <ToggleRow
                label="Putar musik saat undangan dibuka"
                description="Jika mati, tamu tetap dapat memutar musik lewat tombol musik."
                inputProps={register("isMusicAutoPlay")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="invitation-tone" className="block text-xs font-semibold text-slate-700">
                    Gaya bahasa undangan
                  </label>
                  <select
                    id="invitation-tone"
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E11D48]"
                    {...register("tone", { onChange: (e) => handleToneChange(e.target.value) })}
                  >
                    <option value="islami">Islami (Walimatul 'Ursy, Akad Nikah)</option>
                    <option value="umum">Umum (Upacara Pernikahan)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="invitation-timezone" className="block text-xs font-semibold text-slate-700">
                    Zona waktu acara
                  </label>
                  <select
                    id="invitation-timezone"
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E11D48]"
                    {...register("timezone")}
                  >
                    <option value="WIB">WIB (UTC+7)</option>
                    <option value="WITA">WITA (UTC+8)</option>
                    <option value="WIT">WIT (UTC+9)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 mb-2">
                  Kelengkapan undangan ({checklist.filter((c) => c.ok).length}/{checklist.length})
                </p>
                <ul className="space-y-1.5">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-xs">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          item.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                        aria-hidden="true"
                      >
                        {item.ok ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-bold">!</span>}
                      </span>
                      <span className={item.ok ? "text-slate-600" : "text-slate-900 font-semibold"}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Theme Selector */}
            <Card className="p-6 space-y-4">
              <CardHeader>
                <div>
                  <CardTitle>Pilih Tema Visual Undangan</CardTitle>
                  <CardDescription>
                    Pilih estetika desain yang sesuai dengan konsep pernikahan Anda 
                  </CardDescription>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INVITATION_THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setValue("theme", theme.id)}
                      className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? "border-[#E11D48] shadow-md bg-rose-50/30 ring-2 ring-[#E11D48]/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Mini Thumbnail Preview */}
                      <div className={`w-full h-32 rounded-xl p-4 mb-4 flex flex-col justify-center items-center text-center border shadow-inner ${theme.previewBg} ${theme.previewBorder} ${theme.previewText}`}>
                        <span className={`w-3 h-3 rounded-full mb-2 ${theme.accentDot}`} />
                        <p className="text-[10px] tracking-widest uppercase font-serif">The Wedding Of</p>
                        <p className="text-sm font-bold font-serif mt-1">Romeo &amp; Juliet</p>
                        <p className="text-[9px] opacity-70 mt-1">Minggu, 20 Desember 2026</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{theme.name}</h4>
                        <p className="text-[11px] font-semibold text-[#E11D48] mt-0.5">{theme.style}</p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{theme.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Master Foto Sampul & Background Cover */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Foto Sampul Utama &amp; Background Cover</CardTitle>
                  <CardDescription>Foto prewedding / pemandangan beresolusi tinggi yang menjadi latar pembuka undangan</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
                  onClick={() =>
                    setModalPickerConfig({
                      isOpen: true,
                      title: "Pilih Foto Sampul & Background",
                      category: "cover",
                      targetField: "coverPhotoUrl",
                    })
                  }
                >
                  Pilih dari Master Galeri
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {coverPhoto ? (
                  <img
                    src={coverPhoto}
                    alt="Cover Preview"
                    className="w-full sm:w-44 h-28 object-cover rounded-2xl border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-full sm:w-44 h-28 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
                    Belum ada foto
                  </div>
                )}
                <div className="flex-1 w-full space-y-2">
                  <Input
                    label="URL Foto Sampul"
                    placeholder="https://images.unsplash.com/..."
                    hint="Unggah foto Anda, pilih dari Master Galeri, atau tempel tautan foto"
                    {...register("coverPhotoUrl")}
                  />
                  <FileUploadButton
                    kind="image"
                    onUploaded={(url) => setValue("coverPhotoUrl", url, { shouldDirty: true })}
                  />
                </div>
              </div>

              {/* Foto Pembuka (opsional) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Foto Pembuka</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Opsional. Kosongkan untuk memakai foto sampul. Dipakai tema Nocturne Botanica dan Chalk &amp; Vow.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
                    onClick={() =>
                      setModalPickerConfig({
                        isOpen: true,
                        title: "Pilih Foto Pembuka",
                        category: "cover",
                        targetField: "heroPhotoUrl",
                      })
                    }
                  >
                    Pilih dari Master Galeri
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {heroPhoto ? (
                    <img
                      src={heroPhoto}
                      alt="Pratinjau foto pembuka"
                      className="w-full sm:w-44 h-28 object-cover rounded-2xl border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-full sm:w-44 h-28 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                      Memakai foto sampul
                    </div>
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <Input label="URL Foto Pembuka" placeholder="https://..." {...register("heroPhotoUrl")} />
                    <FileUploadButton
                      kind="image"
                      onUploaded={(url) => setValue("heroPhotoUrl", url, { shouldDirty: true })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* URL Slug & Music Settings */}
            <Card className="p-6 space-y-4">
              <CardTitle>Tautan &amp; Musik Latar</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Input
                    label="URL Slug Undangan (Link Khusus)"
                    placeholder="contoh: budi-sari"
                    hint={`Tautan tamu: ${guestLinkExample}. Simbol seperti & menjadi tanda hubung.`}
                    {...register("slug")}
                  />
                  {slugWarning && (
                    <p role="alert" className="text-xs font-medium text-amber-700">
                      {slugWarning}
                    </p>
                  )}
                </div>
                <Input
                  label="Judul Atas Undangan"
                  placeholder="The Wedding of"
                  {...register("title")}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Tautan File Audio / Lagu MP3"
                    placeholder="https://assets.mixkit.co/music/..."
                    hint="Mendukung tautan file .mp3 langsung untuk musik latar otomatis"
                    leftIcon={<Music className="w-4 h-4" />}
                    {...register("bgMusicUrl")}
                  />
                  <div className="mt-2">
                    <FileUploadButton
                      kind="audio"
                      label="Unggah MP3 (maks 10 MB)"
                      onUploaded={(url) => setValue("bgMusicUrl", url, { shouldDirty: true })}
                    />
                  </div>
                </div>
              </div>

              {/* Quotes */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kutipan Pembuka / Ayat Suci
                  </label>
                  <textarea
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E11D48] transition-colors"
                    placeholder="Dan di antara tanda-tanda kebesaran-Nya..."
                    {...register("openingQuote")}
                  />
                </div>
                <div>
                  <Input
                    label="Sumber Kutipan"
                    placeholder="QS. Ar-Rum: 21"
                    {...register("quoteSource")}
                  />
                </div>
              </div>
            </Card>

            <UploadManager />
          </div>
        )}

        {/* ──────────────── TAB 2: MEMPELAI & ACARA ──────────────── */}
        {activeTab === "event" && (
          <div className="space-y-6">
            {/* Mempelai Pria */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>👨 Data Mempelai Pria</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
                  onClick={() =>
                    setModalPickerConfig({
                      isOpen: true,
                      title: "Pilih Foto Mempelai Pria",
                      category: "groom",
                      targetField: "groomPhotoUrl",
                    })
                  }
                >
                  Pilih Foto Pria dari Master
                </Button>
              </div>

              <div className="flex items-center gap-4 pb-2">
                {groomPhoto ? (
                  <img src={groomPhoto} alt="Groom" className="w-16 h-16 rounded-full object-cover border-2 border-[#E11D48] shadow-xs" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl">👨</div>
                )}
                <div className="flex-1">
                  <Input label="URL Foto Pria" placeholder="https://..." {...register("groomPhotoUrl")} />
                  <FileUploadButton
                    kind="image"
                    className="mt-2"
                    onUploaded={(url) => setValue("groomPhotoUrl", url, { shouldDirty: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Lengkap &amp; Gelar" placeholder="Budi Santoso, S.Kom" {...register("groomFullName")} />
                <Input label="Nama Panggilan" placeholder="Budi" {...register("groomNickName")} />
                <Input label="Nama Ayah" placeholder="Bpk. Sutrisno" {...register("groomFather")} />
                <Input label="Nama Ibu" placeholder="Ibu. Maryati" {...register("groomMother")} />
                <Input label="Username Instagram" placeholder="@budisantoso" {...register("groomInstagram")} />
              </div>
            </Card>

            {/* Mempelai Wanita */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>👩 Data Mempelai Wanita</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
                  onClick={() =>
                    setModalPickerConfig({
                      isOpen: true,
                      title: "Pilih Foto Mempelai Wanita",
                      category: "bride",
                      targetField: "bridePhotoUrl",
                    })
                  }
                >
                  Pilih Foto Wanita dari Master
                </Button>
              </div>

              <div className="flex items-center gap-4 pb-2">
                {bridePhoto ? (
                  <img src={bridePhoto} alt="Bride" className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-xs" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl">👩</div>
                )}
                <div className="flex-1">
                  <Input label="URL Foto Wanita" placeholder="https://..." {...register("bridePhotoUrl")} />
                  <FileUploadButton
                    kind="image"
                    className="mt-2"
                    onUploaded={(url) => setValue("bridePhotoUrl", url, { shouldDirty: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Lengkap &amp; Gelar" placeholder="Sari Indah, S.E" {...register("brideFullName")} />
                <Input label="Nama Panggilan" placeholder="Sari" {...register("brideNickName")} />
                <Input label="Nama Ayah" placeholder="Bpk. Hendrawan" {...register("brideFather")} />
                <Input label="Nama Ibu" placeholder="Ibu. Wulandari" {...register("brideMother")} />
                <Input label="Username Instagram" placeholder="@sariindah" {...register("brideInstagram")} />
              </div>
            </Card>

            {/* Detail Akad & Resepsi */}
            <Card className="p-6 space-y-6">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 mb-3">🕌 Akad Nikah</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input type="date" label="Tanggal Akad" {...register("akadDate")} />
                  <Input label="Jam Mulai" placeholder="08:00" {...register("akadStartTime")} />
                  <Input label="Jam Selesai" placeholder="10:00 / Selesai" {...register("akadEndTime")} />
                  <div className="md:col-span-2">
                    <Input label="Nama Tempat / Gedung / Masjid" placeholder="Masjid Agung Jawa Tengah" {...register("akadVenueName")} />
                  </div>
                  <Input label="Tautan Google Maps" placeholder="https://maps.app.goo.gl/..." {...register("akadMapUrl")} />
                  <div className="md:col-span-3">
                    <Input label="Alamat Lengkap" placeholder="Jl. Gajah No. 1, Gayamsari, Semarang" {...register("akadAddress")} />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 mb-3">🎊 Resepsi Pernikahan</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input type="date" label="Tanggal Resepsi" {...register("resepsiDate")} />
                  <Input label="Jam Mulai" placeholder="11:00" {...register("resepsiStartTime")} />
                  <Input label="Jam Selesai" placeholder="14:00" {...register("resepsiEndTime")} />
                  <div className="md:col-span-2">
                    <Input label="Nama Tempat / Ballroom" placeholder="Grand Ballroom Hotel Aston" {...register("resepsiVenueName")} />
                  </div>
                  <Input label="Tautan Google Maps" placeholder="https://maps.app.goo.gl/..." {...register("resepsiMapUrl")} />
                  <div className="md:col-span-3">
                    <Input label="Alamat Lengkap" placeholder="Jl. MT Haryono No. 1, Semarang" {...register("resepsiAddress")} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ──────────────── TAB 3: CERITA & GALERI ──────────────── */}
        {activeTab === "story" && (
          <div className="space-y-6">
            {/* Love Story */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Kisah Perjalanan Cinta (Love Story)</CardTitle>
                  <CardDescription>Bagikan momen penting perjalanan asmara kalian berdua</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() =>
                    setLoveStoryList([
                      ...loveStoryList,
                      { year: new Date().getFullYear().toString(), title: "Judul Momen", story: "Tuliskan cerita..." },
                    ])
                  }
                >
                  Tambah Momen
                </Button>
              </div>

              <div className="space-y-3">
                {loveStoryList.map((story, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-3 items-start">
                    <input
                      type="text"
                      className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-center"
                      value={story.year}
                      onChange={(e) => {
                        const updated = [...loveStoryList];
                        updated[idx].year = e.target.value;
                        setLoveStoryList(updated);
                      }}
                      placeholder="Tahun"
                    />
                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                        value={story.title}
                        onChange={(e) => {
                          const updated = [...loveStoryList];
                          updated[idx].title = e.target.value;
                          setLoveStoryList(updated);
                        }}
                        placeholder="Judul Bab (misal: Pertama Berjumpa)"
                      />
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                        value={story.story}
                        onChange={(e) => {
                          const updated = [...loveStoryList];
                          updated[idx].story = e.target.value;
                          setLoveStoryList(updated);
                        }}
                        placeholder="Ceritakan momen tersebut..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setLoveStoryList(loveStoryList.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Galeri Prewedding */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Galeri Foto Prewedding</CardTitle>
                  <CardDescription>Masukkan foto prewedding atau pilih dari master galeri foto</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <FileUploadButton
                    kind="image"
                    multiple
                    label="Unggah Foto"
                    onUploaded={(url) =>
                      setGalleryList((prev) => [...prev, { url, caption: "" }])
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
                    onClick={() =>
                      setModalPickerConfig({
                        isOpen: true,
                        title: "Tambah Foto dari Master Galeri",
                        category: "gallery",
                        targetField: "gallery",
                      })
                    }
                  >
                    Pilih dari Master Galeri
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() =>
                      setGalleryList([...galleryList, { url: "", caption: "" }])
                    }
                  >
                    Tambah Manual
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {galleryList.map((photo, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative group">
                    {photo.url ? (
                      <img src={photo.url} alt="Gallery" className="w-full h-36 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-36 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                        Belum ada foto
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                        value={photo.url}
                        onChange={(e) => {
                          const updated = [...galleryList];
                          updated[idx].url = e.target.value;
                          setGalleryList(updated);
                        }}
                        placeholder="URL Gambar"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setModalPickerConfig({
                            isOpen: true,
                            title: "Ganti Foto dari Master",
                            category: "gallery",
                            targetField: "gallery",
                            galleryIndex: idx,
                          })
                        }
                        className="p-1 text-slate-500 hover:text-slate-800 bg-slate-200/80 rounded-md"
                        title="Ganti dari master"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                      value={photo.caption || ""}
                      onChange={(e) => {
                        const updated = [...galleryList];
                        updated[idx].caption = e.target.value;
                        setGalleryList(updated);
                      }}
                      placeholder="Keterangan Foto (Opsional)"
                    />
                    <button
                      type="button"
                      onClick={() => setGalleryList(galleryList.filter((_, i) => i !== idx))}
                      className="absolute top-4 right-4 p-1.5 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ──────────────── TAB 4: AMPLOP DIGITAL ──────────────── */}
        {activeTab === "gift" && (
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nomor Rekening &amp; E-Wallet (Kado Digital)</CardTitle>
                  <CardDescription>Tamu dapat menyalin nomor rekening untuk memberikan tanda kasih</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() =>
                    setBankList([
                      ...bankList,
                      { bankName: "BCA", accountNumber: "1234567890", accountHolder: "Nama Pemilik" },
                    ])
                  }
                >
                  Tambah Rekening
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankList.map((acc, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setBankList(bankList.filter((_, i) => i !== idx))}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Input
                      label="Bank / E-Wallet"
                      placeholder="BCA / Mandiri / GoPay / OVO"
                      value={acc.bankName}
                      onChange={(e) => {
                        const updated = [...bankList];
                        updated[idx].bankName = e.target.value;
                        setBankList(updated);
                      }}
                    />
                    <Input
                      label="Nomor Rekening"
                      placeholder="1234567890"
                      value={acc.accountNumber}
                      onChange={(e) => {
                        const updated = [...bankList];
                        updated[idx].accountNumber = e.target.value;
                        setBankList(updated);
                      }}
                    />
                    <Input
                      label="Nama Pemilik Rekening"
                      placeholder="Atas Nama..."
                      value={acc.accountHolder}
                      onChange={(e) => {
                        const updated = [...bankList];
                        updated[idx].accountHolder = e.target.value;
                        setBankList(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <CardTitle>Alamat Pengiriman Kado Fisik</CardTitle>
              <textarea
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E11D48] transition-colors"
                placeholder="Jl. Bahagia No. 12, Kelurahan Harapan, Kota..."
                {...register("giftAddress")}
              />
            </Card>
          </div>
        )}

        {/* ──────────────── TAB 5: TAMU & RSVP ──────────────── */}
        {activeTab === "rsvps" && invitation && <GuestManager invitation={invitation} />}

        {/* Bottom Save Bar */}
        <div className="sticky bottom-4 z-20 p-4 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Pastikan klik <span className="font-bold text-slate-800">Simpan Pengaturan</span> setelah mengubah data.
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={saveMutation.isPending}
          >
            Simpan Pengaturan Undangan
          </Button>
        </div>
      </form>

      {showPreview && draft && <InvitationPreviewPanel draft={draft} onClose={() => setShowPreview(false)} />}

      {/* Preset Image Master Picker Modal */}
      <ImagePresetModal
        isOpen={modalPickerConfig.isOpen}
        onClose={() => setModalPickerConfig({ ...modalPickerConfig, isOpen: false })}
        title={modalPickerConfig.title}
        category={modalPickerConfig.category}
        onSelect={handlePresetSelect}
      />
    </div>
  );
};
