import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Mail,
  ExternalLink,
  Save,
  Check,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Music,
  Users,
  Calendar,
  Heart,
  CreditCard,
  MessageSquare,
  Share2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Settings,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import {
  DigitalInvitation,
  InvitationRsvp,
  InvitationGuest,
  ApiResponse,
  LoveStoryItem,
  GalleryPhotoItem,
  BankAccountItem,
} from "../types/index.js";
import { Topbar } from "../components/layout/Topbar.js";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { Badge } from "../components/ui/Badge.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { ImagePresetModal } from "../components/invitation/ImagePresetModal.js";

// Theme presets matching Inveet references
const THEME_OPTIONS = [
  {
    id: "noir-calla",
    name: "Noir Calla",
    style: "Dark Minimalist & Luxury",
    desc: "Nuansa gelap elegan (noir) dengan aksen bunga calla lily putih dan tipografi emas halus.",
    previewBg: "bg-slate-950",
    previewText: "text-amber-100",
    previewBorder: "border-slate-800",
    accentDot: "bg-[#D4AF37]",
  },
  {
    id: "chalk-and-vow",
    name: "Chalk & Vow",
    style: "Light Fine-Art & Editorial",
    desc: "Kertas chalk hangat, tipografi serif klasik yang airy, bersih, dan romantis.",
    previewBg: "bg-[#FAF7F2]",
    previewText: "text-slate-900",
    previewBorder: "border-stone-300",
    accentDot: "bg-rose-500",
  },
  {
    id: "nocturne-botanica",
    name: "Nocturne Botanica",
    style: "Deep Emerald & Moody Floral",
    desc: "Keanggunan botani malam hari dengan hijau zamrud gelap dan keemasan hangat.",
    previewBg: "bg-[#0A1F18]",
    previewText: "text-emerald-100",
    previewBorder: "border-emerald-900",
    accentDot: "bg-emerald-400",
  },
];

export const InvitationAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"theme" | "event" | "story" | "gift" | "rsvps">("theme");
  const [copiedLink, setCopiedLink] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [guestCategoryInput, setGuestCategoryInput] = useState<"keluarga" | "sahabat" | "vip" | "rekan_kerja">("sahabat");

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
  const { data, isLoading, refetch } = useQuery<ApiResponse<DigitalInvitation>>({
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
        openingQuote: invitation.openingQuote || "",
        quoteSource: invitation.quoteSource || "",
        bgMusicUrl: invitation.bgMusicUrl || "",
        isMusicAutoPlay: invitation.isMusicAutoPlay ?? true,
        isPublished: invitation.isPublished ?? true,

        coverPhotoUrl: invitation.coverPhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80",
        heroPhotoUrl: invitation.heroPhotoUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&auto=format&fit=crop&q=80",

        groomFullName: invitation.groomFullName || "",
        groomNickName: invitation.groomNickName || "",
        groomFather: invitation.groomFather || "",
        groomMother: invitation.groomMother || "",
        groomInstagram: invitation.groomInstagram || "",
        groomPhotoUrl: invitation.groomPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",

        brideFullName: invitation.brideFullName || "",
        brideNickName: invitation.brideNickName || "",
        brideFather: invitation.brideFather || "",
        brideMother: invitation.brideMother || "",
        brideInstagram: invitation.brideInstagram || "",
        bridePhotoUrl: invitation.bridePhotoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",

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

  // Mutation to add guest
  const addGuestMutation = useMutation({
    mutationFn: async (guestData: { name: string; category: string }) => {
      const res = await api.post("/invitation/guests", guestData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digital-invitation-config"] });
      setGuestNameInput("");
      toast.success("Tamu Berhasil Ditambahkan!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal menambah tamu");
    },
  });

  // Mutation to delete guest
  const deleteGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      const res = await api.delete(`/invitation/guests/${guestId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digital-invitation-config"] });
      toast.success("Tamu dihapus dari daftar");
    },
  });

  // Mutation to delete RSVP comment
  const deleteRsvpMutation = useMutation({
    mutationFn: async (rsvpId: string) => {
      const res = await api.delete(`/invitation/rsvps/${rsvpId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digital-invitation-config"] });
      toast.success("Ucapan berhasil dihapus");
    },
  });

  const selectedTheme = watch("theme") || "noir-calla";
  const currentSlug = watch("slug") || invitation?.slug || "wedding";
  const coverPhoto = watch("coverPhotoUrl");
  const groomPhoto = watch("groomPhotoUrl");
  const bridePhoto = watch("bridePhotoUrl");

  const publicUrl = `${window.location.origin}/invitation/${currentSlug}`;

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    toast.success("Tautan Berhasil Disalin!", { description: publicUrl });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyWhatsAppText = (guestName: string, guestSlug: string) => {
    const link = `${window.location.origin}/invitation/${currentSlug}?to=${encodeURIComponent(guestName)}`;
    const text = `Kepada Yth. Bpk/Ibu/Saudara/i *${guestName}*,

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara pernikahan kami:

${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu. Terima kasih.`;

    navigator.clipboard.writeText(text);
    toast.success("Teks Undangan WhatsApp Tersalin!", {
      description: `Siap dikirimkan untuk ${guestName}`,
    });
  };

  const handlePresetSelect = (url: string) => {
    if (modalPickerConfig.targetField === "gallery") {
      if (modalPickerConfig.galleryIndex !== undefined) {
        const updated = [...galleryList];
        updated[modalPickerConfig.galleryIndex].url = url;
        setGalleryList(updated);
      } else {
        setGalleryList([...galleryList, { url, caption: "Momen Bahagia" }]);
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
  const guests = invitation?.guests || [];

  const attendingCount = rsvps.filter((r) => r.attendanceStatus === "hadir").length;
  const totalGuestsComing = rsvps
    .filter((r) => r.attendanceStatus === "hadir")
    .reduce((acc, curr) => acc + (curr.guestCount || 1), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Topbar */}
      <Topbar
        title="Undangan Pernikahan Digital"
        description="Kelola tema Inveet, master foto/gambar, detail acara, amplop digital, dan buku tamu online"
        action={
          <div className="flex items-center gap-2">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                Lihat Undangan ↗
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
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Tautan Undangan Publik Aktif
            </span>
            <Badge variant="neutral" size="sm" className="bg-white/10 text-white border-0">
              Tema: {THEME_OPTIONS.find((t) => t.id === selectedTheme)?.name}
            </Badge>
          </div>
          <p className="text-sm md:text-base font-bold text-slate-100 font-mono break-all">
            {publicUrl}
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
            {/* Theme Selector */}
            <Card className="p-6 space-y-4">
              <CardHeader>
                <div>
                  <CardTitle>Pilih Tema Visual Undangan</CardTitle>
                  <CardDescription>
                    Pilih estetika desain yang sesuai dengan konsep pernikahan Anda (Sesuai Referensi Inveet)
                  </CardDescription>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {THEME_OPTIONS.map((theme) => {
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
                    hint="Klik tombol 'Pilih dari Master Galeri' atau tempel tautan foto Anda sendiri"
                    {...register("coverPhotoUrl")}
                  />
                </div>
              </div>
            </Card>

            {/* URL Slug & Music Settings */}
            <Card className="p-6 space-y-4">
              <CardTitle>Tautan &amp; Musik Latar</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="URL Slug Undangan (Link Khusus)"
                  placeholder="contoh: budi-sari"
                  hint="Tautan Anda: /invitation/nama-pilihan"
                  {...register("slug")}
                />
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
                <div className="flex items-center gap-2">
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
                      setGalleryList([
                        ...galleryList,
                        { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", caption: "Momen Bahagia" },
                      ])
                    }
                  >
                    Tambah Manual
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {galleryList.map((photo, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative group">
                    <img src={photo.url} alt="Gallery" className="w-full h-36 object-cover rounded-xl" />
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
        {activeTab === "rsvps" && (
          <div className="space-y-6">
            {/* Generator Undangan WhatsApp */}
            <Card className="p-6 space-y-4">
              <CardTitle>Generator Link WhatsApp Per Tamu</CardTitle>
              <CardDescription>
                Buat tautan personalisasi otomatis untuk tiap nama tamu, lengkap dengan tombol salin teks WhatsApp
              </CardDescription>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
                  placeholder="Nama Lengkap Tamu (contoh: Bpk. Bambang Sutrisno)"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                />
                <select
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  value={guestCategoryInput}
                  onChange={(e: any) => setGuestCategoryInput(e.target.value)}
                >
                  <option value="keluarga">Keluarga</option>
                  <option value="sahabat">Sahabat</option>
                  <option value="vip">VIP</option>
                  <option value="rekan_kerja">Rekan Kerja</option>
                </select>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  isLoading={addGuestMutation.isPending}
                  onClick={() => {
                    if (!guestNameInput.trim()) return toast.error("Masukkan nama tamu!");
                    addGuestMutation.mutate({
                      name: guestNameInput,
                      category: guestCategoryInput,
                    });
                  }}
                >
                  Tambah Tamu
                </Button>
              </div>

              {/* Guest Table */}
              {guests.length > 0 && (
                <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="p-3">Nama Tamu</th>
                          <th className="p-3">Kategori</th>
                          <th className="p-3">Link Personalisasi</th>
                          <th className="p-3 text-right">Aksi WhatsApp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {guests.map((g) => {
                          const guestLink = `${publicUrl}?to=${encodeURIComponent(g.name)}`;
                          return (
                            <tr key={g.id} className="hover:bg-slate-50/60">
                              <td className="p-3 font-bold text-slate-900">{g.name}</td>
                              <td className="p-3">
                                <Badge variant="neutral" size="sm">
                                  {g.category}
                                </Badge>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                                {guestLink}
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-[11px] py-1 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                  leftIcon={<Share2 className="w-3 h-3" />}
                                  onClick={() => copyWhatsAppText(g.name, g.slug)}
                                >
                                  Salin Teks WA
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => deleteGuestMutation.mutate(g.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>

            {/* Rekap Buku Tamu & RSVP */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Buku Tamu Online &amp; Ucapan Doa ({rsvps.length})</CardTitle>
                  <CardDescription>Daftar konfirmasi kehadiran dan doa restu dari tamu undangan</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    {attendingCount} Hadir
                  </Badge>
                  <Badge variant="danger" size="sm">
                    {rsvps.filter((r) => r.attendanceStatus === "tidak_hadir").length} Berhalangan
                  </Badge>
                </div>
              </div>

              {rsvps.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada ucapan atau konfirmasi RSVP dari tamu.
                </div>
              ) : (
                <div className="space-y-3">
                  {rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{rsvp.guestName}</h4>
                          <Badge
                            variant={
                              rsvp.attendanceStatus === "hadir"
                                ? "success"
                                : rsvp.attendanceStatus === "tidak_hadir"
                                ? "danger"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {rsvp.attendanceStatus === "hadir"
                              ? `Hadir (${rsvp.guestCount} org)`
                              : rsvp.attendanceStatus === "tidak_hadir"
                              ? "Berhalangan"
                              : "Ragu-ragu"}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rsvp.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {rsvp.message && (
                          <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            "{rsvp.message}"
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteRsvpMutation.mutate(rsvp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                        title="Hapus Ucapan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

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
