import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Coins,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  FileDown,
  FileSpreadsheet,
  Search,
  Receipt,
  Hourglass,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { BudgetItem, BudgetSummary, CategoryBreakdown, ApiResponse } from "../types/index.js";
import { useAuthStore } from "../store/authStore.js";
import { formatRupiah, formatShortRupiah } from "../lib/utils.js";
import { exportBudgetPDF, exportBudgetExcel } from "../lib/exportUtils.js";
import { Topbar } from "../components/layout/Topbar.js";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Input } from "../components/ui/Input.js";
import { Modal } from "../components/ui/Modal.js";
import { Skeleton } from "../components/ui/Skeleton.js";

const CATEGORIES = [
  { id: "all", name: "Semua Kategori" },
  { id: "venue", name: "Venue & Gedung" },
  { id: "katering", name: "Katering" },
  { id: "dekorasi", name: "Dekorasi" },
  { id: "busana", name: "Busana & Rias" },
  { id: "dokumentasi", name: "Dokumentasi" },
  { id: "hiburan", name: "Hiburan / Musik" },
  { id: "transport", name: "Transportasi" },
  { id: "undangan", name: "Undangan & Souvenir" },
  { id: "mas_kawin", name: "Mas Kawin / Mahar" },
  { id: "lainnya", name: "Lain-lain" },
];

const categoryLabels: Record<string, string> = {
  venue: "Venue & Gedung",
  katering: "Katering",
  dekorasi: "Dekorasi",
  busana: "Busana & Rias",
  dokumentasi: "Dokumentasi",
  hiburan: "Hiburan / Musik",
  transport: "Transportasi",
  undangan: "Undangan & Souvenir",
  mas_kawin: "Mas Kawin / Mahar",
  lainnya: "Lain-lain",
};

const budgetSchema = z.object({
  category: z.string().min(1, "Kategori wajib dipilih"),
  itemName: z.string().min(1, "Nama item wajib diisi"),
  estimatedCost: z.coerce.number().nonnegative("Estimasi tidak boleh negatif").default(0),
  actualCost: z.coerce.number().nonnegative("Aktual tidak boleh negatif").default(0),
  amountPaid: z.coerce.number().nonnegative("Nominal DP tidak boleh negatif").default(0),
  paymentStatus: z.enum(["unpaid", "dp", "paid"]).default("unpaid"),
  vendorName: z.string().optional(),
  notes: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export const BudgetPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Fetch Budget Data
  const { data, isLoading } = useQuery<
    ApiResponse<{
      summary: BudgetSummary;
      categoryBreakdown: CategoryBreakdown[];
      items: BudgetItem[];
    }>
  >({
    queryKey: ["budget-items"],
    queryFn: async () => {
      const res = await api.get("/budget");
      return res.data;
    },
  });

  const budgetData = data?.data;
  const items = Array.isArray(budgetData?.items) ? budgetData.items : [];
  const summary: BudgetSummary = budgetData?.summary || {
    totalBudget: profile?.totalBudget || 0,
    totalEstimated: 0,
    totalActual: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalRemainingToPay: 0,
    remainingBudget: profile?.totalBudget || 0,
    itemCount: 0,
  };

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "venue",
      paymentStatus: "unpaid",
      estimatedCost: 0,
      actualCost: 0,
      amountPaid: 0,
      itemName: "",
      vendorName: "",
      notes: "",
    },
  });

  const watchedPaymentStatus = useWatch({ control, name: "paymentStatus" });
  const rawActual = useWatch({ control, name: "actualCost" });
  const rawEstimated = useWatch({ control, name: "estimatedCost" });
  const rawAmountPaid = useWatch({ control, name: "amountPaid" });

  const watchedActual = Number(rawActual) || Number(rawEstimated) || 0;
  const watchedAmountPaid = Number(rawAmountPaid) || 0;
  const calculatedRemaining = Math.max(0, watchedActual - watchedAmountPaid);

  const openAddModal = () => {
    setEditingItem(null);
    reset({
      category: selectedCategory === "all" ? "venue" : selectedCategory,
      paymentStatus: "unpaid",
      estimatedCost: 0,
      actualCost: 0,
      amountPaid: 0,
      itemName: "",
      vendorName: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    reset({
      category: item.category || "venue",
      itemName: item.itemName || "",
      estimatedCost: Number(item.estimatedCost) || 0,
      actualCost: Number(item.actualCost) || 0,
      amountPaid: Number(item.amountPaid) || 0,
      paymentStatus: item.paymentStatus || "unpaid",
      vendorName: item.vendorName || "",
      notes: item.notes || "",
    });
    setIsModalOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData: BudgetFormData) => api.post("/budget", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Item anggaran berhasil ditambahkan!");
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => {
      toast.error("Gagal menambahkan item", {
        description: err.response?.data?.message || "Terjadi kesalahan.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: BudgetFormData }) =>
      api.put(`/budget/${payload.id}`, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Item anggaran berhasil diperbarui!");
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => {
      toast.error("Gagal memperbarui item", {
        description: err.response?.data?.message || "Terjadi kesalahan.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/budget/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Item anggaran berhasil dihapus!");
    },
    onError: (err: any) => {
      toast.error("Gagal menghapus item", {
        description: err.response?.data?.message || "Terjadi kesalahan.",
      });
    },
  });

  const onSubmit = (formData: BudgetFormData) => {
    const actualNum = Number(formData.actualCost) || 0;
    const estNum = Number(formData.estimatedCost) || 0;
    const dpNum = Number(formData.amountPaid) || 0;

    let finalAmountPaid = 0;
    if (formData.paymentStatus === "paid") {
      finalAmountPaid = actualNum || estNum || 0;
    } else if (formData.paymentStatus === "dp") {
      finalAmountPaid = dpNum;
    } else {
      finalAmountPaid = 0;
    }

    const payload: BudgetFormData = {
      ...formData,
      estimatedCost: estNum,
      actualCost: actualNum,
      amountPaid: finalAmountPaid,
    };

    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Filter Items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const nameMatch = (item.itemName || "").toLowerCase().includes(q);
    const vendorMatch = (item.vendorName || "").toLowerCase().includes(q);
    return matchesCategory && (nameMatch || vendorMatch);
  });

  // Chart Data Preparation (Estimated vs Actual)
  const chartData = (budgetData?.categoryBreakdown || []).map((cat) => ({
    name: categoryLabels[cat.category] || cat.category || "Lainnya",
    Estimasi: Number(cat.estimated) || 0,
    Aktual: Number(cat.actual) || 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar
        title="Budget Planner"
        description="Rencanakan, kelola DP vendor, dan pantau pelunasan pengeluaran pernikahan"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportBudgetPDF(items, summary, profile)}
              leftIcon={<FileDown className="w-3.5 h-3.5 text-rose-600" />}
            >
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportBudgetExcel(items, summary, profile)}
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

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Target */}
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Target Anggaran</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {formatRupiah(summary.totalBudget)}
            </h3>
            <p className="text-[11px] text-slate-400">Total alokasi pernikahan</p>
          </div>
        </Card>

        {/* Total Realisasi Aktual */}
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Komitmen Biaya</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {formatRupiah(summary.totalActual || summary.totalEstimated)}
            </h3>
            <p className="text-[11px] text-slate-400">{summary.itemCount} pos pengeluaran</p>
          </div>
        </Card>

        {/* Total Kas Keluar (Sudah Dibayar) */}
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Sudah Dibayar (DP + Lunas)</p>
            <h3 className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {formatRupiah(summary.totalPaid)}
            </h3>
            <p className="text-[11px] text-slate-400">Total uang kas telah keluar</p>
          </div>
        </Card>

        {/* Sisa Tagihan Vendor (Hutang) */}
        <Card className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              summary.totalUnpaid > 0
                ? "bg-amber-50 border border-amber-100 text-amber-600"
                : "bg-slate-50 border border-slate-100 text-slate-400"
            }`}
          >
            {summary.totalUnpaid > 0 ? (
              <Hourglass className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Sisa Tagihan Belum Lunas</p>
            <h3
              className={`text-xl font-extrabold mt-0.5 ${
                summary.totalUnpaid > 0 ? "text-amber-600" : "text-slate-800"
              }`}
            >
              {formatRupiah(summary.totalUnpaid)}
            </h3>
            <p className="text-[11px] text-slate-400">
              {summary.totalUnpaid > 0 ? "Harus disiapkan pelunasannya" : "Semua vendor sudah lunas"}
            </p>
          </div>
        </Card>
      </div>

      {/* 2. Comparison Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Perbandingan Estimasi vs Realisasi Biaya</CardTitle>
              <CardDescription>Visualisasi alokasi pengeluaran per kategori pernikahan</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tickFormatter={(val) => formatShortRupiah(val)} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(val)]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                <Bar dataKey="Estimasi" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Aktual" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 3. Category Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Scrollable Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#E11D48] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64 shrink-0">
            <Input
              placeholder="Cari item atau vendor..."
              leftIcon={<Search className="w-3.5 h-3.5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Table Card */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Nama Item</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4 text-right">Total Biaya</th>
                  <th className="py-3.5 px-4 text-right">Sudah Bayar / DP</th>
                  <th className="py-3.5 px-4 text-center">Status Pembayaran</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={7} className="p-4">
                        <Skeleton height={20} />
                      </td>
                    </tr>
                  ))
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const totalCost = Number(item.actualCost) || Number(item.estimatedCost) || 0;
                    const amountPaid =
                      item.paymentStatus === "paid"
                        ? totalCost
                        : item.paymentStatus === "dp"
                        ? Number(item.amountPaid) || 0
                        : 0;
                    const remainingToPay = Math.max(0, totalCost - amountPaid);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.itemName}</p>
                          {item.notes && <p className="text-[11px] text-slate-400 mt-0.5">{item.notes}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="neutral" size="sm">
                            {categoryLabels[item.category] || item.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600">{item.vendorName || "-"}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatRupiah(totalCost)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-slate-800 block">
                            {formatRupiah(amountPaid)}
                          </span>
                          {item.paymentStatus === "dp" && remainingToPay > 0 && (
                            <span className="text-[10px] text-rose-500 font-medium block">
                              Sisa: {formatRupiah(remainingToPay)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.paymentStatus === "paid" ? (
                            <Badge variant="success" size="sm">
                              ✓ Lunas
                            </Badge>
                          ) : item.paymentStatus === "dp" ? (
                            <div className="inline-flex flex-col items-center">
                              <Badge variant="warning" size="sm">
                                DP Dibayar
                              </Badge>
                            </div>
                          ) : (
                            <Badge variant="rose" size="sm">
                              Belum Bayar
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus item "${item.itemName}"?`)) {
                                  deleteMutation.mutate(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <p className="font-medium text-xs">Belum ada pos pengeluaran dalam kategori ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 4. Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Pos Pengeluaran" : "Tambah Pos Pengeluaran Baru"}
        description="Masukkan rincian kebutuhan, nominal DP, dan status pembayaran vendor"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Pengeluaran
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
              {...register("category")}
            >
              {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nama Item / Kebutuhan"
            placeholder="Contoh: Sewa Gedung, Katering 500 Pax, MUA Akad"
            error={errors.itemName?.message}
            {...register("itemName")}
          />

          <Input
            label="Nama Vendor (Opsional)"
            placeholder="Contoh: Sanggar Cantik Wedding, Katering Bu Siti"
            {...register("vendorName")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Biaya Estimasi / Budget (Rp)"
              type="number"
              placeholder="0"
              error={errors.estimatedCost?.message}
              {...register("estimatedCost")}
            />

            <Input
              label="Realisasi Biaya Aktual (Rp)"
              type="number"
              placeholder="0"
              error={errors.actualCost?.message}
              {...register("actualCost")}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status Pembayaran
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
              {...register("paymentStatus")}
            >
              <option value="unpaid">Belum Bayar (Rp 0)</option>
              <option value="dp">Uang Muka (DP)</option>
              <option value="paid">Lunas (100%)</option>
            </select>
          </div>

          {/* Conditional DP Input Field */}
          {watchedPaymentStatus === "dp" && (
            <div className="space-y-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl animate-fade-in">
              <Input
                label="Nominal DP yang Sudah Dibayar (Rp)"
                type="number"
                placeholder="Contoh: 10000000"
                error={errors.amountPaid?.message}
                {...register("amountPaid")}
              />

              <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Biaya:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(watchedActual)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DP Masuk:</span>
                  <span className="font-bold text-amber-700">{formatRupiah(watchedAmountPaid)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Sisa Pelunasan:</span>
                  <span className="font-extrabold text-[#E11D48]">{formatRupiah(calculatedRemaining)}</span>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Catatan Tambahan (Opsional)"
            placeholder="Contoh: DP 50% sudah ditransfer, pelunasan H-7 acara"
            {...register("notes")}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? "Simpan Perubahan" : "Tambahkan Item"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
