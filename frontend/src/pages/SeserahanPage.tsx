import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Gift,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Layers,
  Heart,
  ExternalLink,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { SeserahanItem, SeserahanTemplate, ApiResponse } from "../types/index.js";
import { useAuthStore } from "../store/authStore.js";
import { formatRupiah, formatShortRupiah, cn } from "../lib/utils.js";
import { exportSeserahanExcel } from "../lib/exportUtils.js";
import { Topbar } from "../components/layout/Topbar.js";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Input } from "../components/ui/Input.js";
import { Modal } from "../components/ui/Modal.js";
import { ProgressBar } from "../components/ui/ProgressBar.js";
import { Skeleton } from "../components/ui/Skeleton.js";

const SESERAHAN_CATEGORIES = [
  { id: "all", name: "Semua Kategori" },
  { id: "ibadah", name: "Perlengkapan Ibadah" },
  { id: "perhiasan", name: "Perhiasan & Mahar" },
  { id: "pakaian", name: "Pakaian & Aksesoris" },
  { id: "kosmetik", name: "Kosmetik & Skincare" },
  { id: "perlengkapan_mandi", name: "Perlengkapan Mandi" },
  { id: "peralatan_rumah", name: "Peralatan Rumah / Sprei" },
  { id: "makanan_minuman", name: "Makanan & Buah" },
  { id: "lainnya", name: "Lain-lain" },
];

const categoryLabels: Record<string, string> = {
  ibadah: "Perlengkapan Ibadah",
  perhiasan: "Perhiasan & Mahar",
  pakaian: "Pakaian & Aksesoris",
  kosmetik: "Kosmetik & Skincare",
  perlengkapan_mandi: "Perlengkapan Mandi",
  peralatan_rumah: "Peralatan Rumah",
  makanan_minuman: "Makanan & Buah",
  lainnya: "Lain-lain",
};

const seserahanSchema = z.object({
  itemName: z.string().min(1, "Nama item seserahan wajib diisi"),
  category: z.string().default("lainnya"),
  estimatedPrice: z.coerce.number().nonnegative("Estimasi harga tidak boleh negatif").default(0),
  actualPrice: z.coerce.number().nonnegative("Harga aktual tidak boleh negatif").default(0),
  quantity: z.coerce.number().int().positive("Jumlah minimal 1").default(1),
  giver: z.enum(["groom", "bride"]).default("groom"),
  isPrepared: z.boolean().default(false),
  brand: z.string().optional(),
  link: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^https?:\/\//.test(val),
      "Link harus diawali dengan https://"
    ),
  notes: z.string().optional(),
});

type SeserahanFormData = z.infer<typeof seserahanSchema>;

export const SeserahanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGiver, setSelectedGiver] = useState<"all" | "groom" | "bride">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeserahanItem | null>(null);
  const [selectedTemplateIndices, setSelectedTemplateIndices] = useState<number[]>([]);

  // Sticky scroll detection
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Items
  const { data, isLoading } = useQuery<
    ApiResponse<{
      summary: {
        totalItems: number;
        preparedCount: number;
        remainingCount: number;
        totalEstimatedPrice: number;
        totalActualPrice: number;
        progressPercentage: number;
      };
      categoryBreakdown: Record<string, { total: number; prepared: number }>;
      items: SeserahanItem[];
    }>
  >({
    queryKey: ["seserahan-items"],
    queryFn: async () => {
      const res = await api.get("/seserahan");
      return res.data;
    },
  });

  // Fetch Templates
  const { data: templateData } = useQuery<ApiResponse<SeserahanTemplate[]>>({
    queryKey: ["seserahan-templates"],
    queryFn: async () => {
      const res = await api.get("/seserahan/templates");
      return res.data;
    },
  });

  const seserahanData = data?.data;
  const items = seserahanData?.items || [];
  const templates = templateData?.data || [];
  const summary = seserahanData?.summary || {
    totalItems: 0,
    preparedCount: 0,
    remainingCount: 0,
    totalEstimatedPrice: 0,
    totalActualPrice: 0,
    progressPercentage: 0,
  };

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SeserahanFormData>({
    resolver: zodResolver(seserahanSchema),
    defaultValues: {
      category: "pakaian",
      giver: "groom",
      quantity: 1,
      estimatedPrice: 0,
      actualPrice: 0,
      isPrepared: false,
    },
  });

  const openAddModal = () => {
    setEditingItem(null);
    reset({
      itemName: "",
      category: selectedCategory === "all" ? "pakaian" : selectedCategory,
      giver: selectedGiver === "all" ? "groom" : selectedGiver,
      quantity: 1,
      estimatedPrice: 0,
      actualPrice: 0,
      isPrepared: false,
      brand: "",
      link: "",
      notes: "",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: SeserahanItem) => {
    setEditingItem(item);
    setValue("itemName", item.itemName);
    setValue("category", item.category);
    setValue("giver", item.giver);
    setValue("quantity", item.quantity);
    setValue("estimatedPrice", item.estimatedPrice);
    setValue("actualPrice", item.actualPrice);
    setValue("isPrepared", item.isPrepared);
    setValue("brand", item.brand || "");
    setValue("link", item.link || "");
    setValue("notes", item.notes || "");
    setIsAddModalOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData: SeserahanFormData) => api.post("/seserahan", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seserahan-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Item seserahan berhasil ditambahkan!");
      setIsAddModalOpen(false);
    },
    onError: (err: any) => {
      toast.error("Gagal menambahkan", { description: err.response?.data?.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: SeserahanFormData) => api.put(`/seserahan/${editingItem?.id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seserahan-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Item seserahan berhasil diperbarui!");
      setIsAddModalOpen(false);
    },
    onError: (err: any) => {
      toast.error("Gagal memperbarui", { description: err.response?.data?.message });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isPrepared }: { id: string; isPrepared: boolean }) =>
      api.put(`/seserahan/${id}`, { isPrepared }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seserahan-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/seserahan/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seserahan-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Item seserahan dihapus!");
    },
  });

  const importTemplateMutation = useMutation({
    mutationFn: (indices: number[]) =>
      api.post("/seserahan/import-templates", { itemIndices: indices }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["seserahan-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Template berhasil diimpor! 🎁", {
        description: res.data.message,
      });
      setIsTemplateModalOpen(false);
      setSelectedTemplateIndices([]);
    },
    onError: (err: any) => {
      toast.error("Gagal mengimpor template", { description: err.response?.data?.message });
    },
  });

  const onSubmit = (formData: SeserahanFormData) => {
    const payload = {
      ...formData,
      estimatedPrice: formData.actualPrice || 0,
    };
    if (editingItem) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesGiver = selectedGiver === "all" || item.giver === selectedGiver;
    return matchesCategory && matchesGiver;
  });

  const toggleSelectAllTemplates = () => {
    if (selectedTemplateIndices.length === templates.length) {
      setSelectedTemplateIndices([]);
    } else {
      setSelectedTemplateIndices(templates.map((_, i) => i));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar
        sticky={false}
        title="Daftar Seserahan & Hantaran"
        description="Kelola barang bawaan seserahan adat pernikahan dari kedua belah pihak mempelai"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTemplateModalOpen(true)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            >
              Gunakan Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSeserahanExcel(items, profile)}
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Export Excel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={openAddModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Tambah Item
            </Button>
          </div>
        }
      />

      {/* 1. Progress Banner Card (Sticky on scroll) */}
      <Card
        className={cn(
          "sticky top-[52px] md:top-3 z-20 transition-all duration-300",
          "border border-amber-200/70",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg p-3.5 sm:p-4 border-amber-300/80 rounded-2xl"
            : "bg-gradient-to-r from-amber-50/80 via-rose-50/50 to-white p-5 sm:p-6 shadow-xs"
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="gold" size="sm">
                Progres Kesiapan
              </Badge>
              <span className="text-xs font-bold text-slate-800">
                {summary.preparedCount} dari {summary.totalItems} Barang Siap
              </span>
              {isScrolled && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openAddModal}
                  className="h-7 px-2.5 text-xs py-0 ml-1 hidden sm:inline-flex"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Tambah Item
                </Button>
              )}
            </div>
            <h2
              className={`font-extrabold text-slate-900 tracking-tight transition-all ${
                isScrolled ? "text-base sm:text-lg md:text-xl" : "text-xl sm:text-2xl"
              }`}
            >
              Total Nilai Seserahan:{" "}
              <span className="text-amber-700">
                {formatRupiah(summary.totalActualPrice || summary.totalEstimatedPrice)}
              </span>
            </h2>
            {!isScrolled && (
              <p className="text-xs text-slate-500">
                Centang kotak pada kartu di bawah saat barang seserahan telah dibeli dan dihias.
              </p>
            )}
          </div>

          <div
            className={`transition-all duration-300 ${
              isScrolled
                ? "w-full md:w-64 bg-amber-50/70 p-2.5 sm:p-3 rounded-xl border border-amber-200/80"
                : "w-full md:w-72 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">Persentase</span>
              <span className="text-sm font-black text-amber-600">
                {summary.progressPercentage}%
              </span>
            </div>
            <ProgressBar
              value={summary.progressPercentage}
              colorVariant="amber"
              size={isScrolled ? "sm" : "md"}
              showPercentage={false}
            />
          </div>
        </div>
      </Card>

      {/* 2. Filters (Pihak Pemberi & Kategori) */}
      <div className="space-y-3">
        {/* Giver Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 mr-1">Pemberi:</span>
          <button
            onClick={() => setSelectedGiver("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedGiver === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua Pihak
          </button>
          <button
            onClick={() => setSelectedGiver("groom")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedGiver === "groom"
                ? "bg-[#E11D48] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            👨 Dari Pria ({items.filter((i) => i.giver === "groom").length})
          </button>
          <button
            onClick={() => setSelectedGiver("bride")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedGiver === "bride"
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            👩 Dari Wanita / Angsul ({items.filter((i) => i.giver === "bride").length})
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SESERAHAN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Seserahan Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} height={150} rounded="2xl" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`flex flex-col justify-between transition-all duration-200 ${
                item.isPrepared ? "bg-emerald-50/20 border-emerald-200" : "hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge variant={item.giver === "groom" ? "rose" : "gold"} size="sm">
                    {item.giver === "groom" ? "Dari Pria" : "Dari Wanita"}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {categoryLabels[item.category] || item.category}
                  </Badge>
                </div>

                <div className="flex items-start gap-3 mt-3">
                  <button
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        id: item.id,
                        isPrepared: !item.isPrepared,
                      })
                    }
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {item.isPrepared ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h4
                      className={`text-sm font-bold text-slate-900 leading-snug ${
                        item.isPrepared ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {item.itemName}
                    </h4>
                    {item.brand && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Tag className="w-3 h-3" />
                        {item.brand}
                      </span>
                    )}
                    {item.notes && (
                      <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block leading-none">
                    Qty: {item.quantity} box/set
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 mt-1 block">
                    {formatRupiah(item.actualPrice || item.estimatedPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Buka Link Produk"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus seserahan "${item.itemName}"?`)) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center text-slate-400 space-y-3">
          <Gift className="w-12 h-12 mx-auto text-amber-300" />
          <h3 className="text-sm font-bold text-slate-700">Daftar Seserahan Masih Kosong</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Kamu bisa memasukkan barang secara manual atau gunakan template 20+ item seserahan adat pernikahan Indonesia.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTemplateModalOpen(true)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            >
              Gunakan Template Standar
            </Button>
            <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Tambah Manual
            </Button>
          </div>
        </Card>
      )}

      {/* 4. Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingItem ? "Edit Item Seserahan" : "Tambah Item Seserahan"}
        description="Rincian barang hantaran dan perkiraan harganya"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pihak Pemberi
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
              {...register("giver")}
            >
              <option value="groom">Mempelai Pria (Seserahan untuk Wanita)</option>
              <option value="bride">Mempelai Wanita (Angsul-angsul balasan untuk Pria)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Barang
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
              {...register("category")}
            >
              {SESERAHAN_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nama Barang / Paket"
            placeholder="Contoh: Set Mukena Sutra & Sajadah, Set Skincare"
            error={errors.itemName?.message}
            {...register("itemName")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Jumlah Box / Qty"
              type="number"
              placeholder="1"
              error={errors.quantity?.message}
              {...register("quantity")}
            />

            <Input
              label="Perkiraan Harga (Rp)"
              type="number"
              placeholder="0"
              error={errors.actualPrice?.message}
              {...register("actualPrice")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Merk / Brand (Opsional)"
              placeholder="Contoh: Wardah, La Tulipe, Swarovski"
              error={errors.brand?.message}
              {...register("brand")}
            />

            <Input
              label="Link Produk (Opsional)"
              placeholder="https://tokopedia.com/..."
              error={errors.link?.message}
              {...register("link")}
            />
          </div>

          <Input
            label="Catatan Khusus (Opsional)"
            placeholder="Contoh: Warna putih gading, ukuran 38"
            {...register("notes")}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPrepared"
              className="w-4 h-4 rounded text-[#E11D48] focus:ring-[#E11D48]"
              {...register("isPrepared")}
            />
            <label htmlFor="isPrepared" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Barang sudah dibeli &amp; siap dihias
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? "Simpan Perubahan" : "Tambahkan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. Template Selector Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Pilih Template Seserahan Adat Indonesia"
        description="Pilih item-item standar yang ingin dimasukkan otomatis ke daftar seserahanmu"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              {selectedTemplateIndices.length} dari {templates.length} item dipilih
            </span>
            <button
              type="button"
              onClick={toggleSelectAllTemplates}
              className="text-xs font-bold text-[#E11D48] hover:underline"
            >
              {selectedTemplateIndices.length === templates.length ? "Batal Semua" : "Pilih Semua"}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {templates.map((tpl, index) => {
              const isSelected = selectedTemplateIndices.includes(index);
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTemplateIndices((prev) => prev.filter((i) => i !== index));
                    } else {
                      setSelectedTemplateIndices((prev) => [...prev, index]);
                    }
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-rose-50/70 border-rose-200 text-slate-900"
                      : "bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-[#E11D48] border-[#E11D48] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <div>
                      <p className="font-bold">{tpl.itemName}</p>
                      <p className="text-[11px] text-slate-400">
                        {categoryLabels[tpl.category] || tpl.category} • {tpl.giver === "groom" ? "Pria ➔ Wanita" : "Wanita ➔ Pria"}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 ml-2">
                    {formatRupiah(tpl.estimatedPrice)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTemplateModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={selectedTemplateIndices.length === 0}
              isLoading={importTemplateMutation.isPending}
              onClick={() => importTemplateMutation.mutate(selectedTemplateIndices)}
            >
              Impor {selectedTemplateIndices.length} Item Terpilih
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
