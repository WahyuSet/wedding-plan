import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileCheck2,
  Plus,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { KuaDocument, ApiResponse } from "../types/index.js";
import { formatDateShort } from "../lib/utils.js";
import { Topbar } from "../components/layout/Topbar.js";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Input } from "../components/ui/Input.js";
import { Modal } from "../components/ui/Modal.js";
import { ProgressBar } from "../components/ui/ProgressBar.js";
import { Skeleton } from "../components/ui/Skeleton.js";

const PARTIES = [
  { id: "calon_pria", label: "👨 Mempelai Pria" },
  { id: "calon_wanita", label: "👩 Mempelai Wanita" },
  { id: "wali", label: "👥 Wali Nikah" },
  { id: "kua", label: "🕌 Administrasi KUA" },
];

const kuaDocSchema = z.object({
  documentName: z.string().min(1, "Nama dokumen wajib diisi"),
  documentCode: z.string().optional(),
  documentType: z.string().default("persyaratan"),
  fromParty: z.enum(["calon_pria", "calon_wanita", "wali", "kua"]),
  deadline: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  notes: z.string().optional(),
});

type KuaDocFormData = z.infer<typeof kuaDocSchema>;

export const DokumenKuaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedParty, setSelectedParty] = useState("calon_pria");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KuaDocument | null>(null);

  // Fetch KUA Docs
  const { data, isLoading } = useQuery<
    ApiResponse<{
      summary: {
        totalDocuments: number;
        completedCount: number;
        inProgressCount: number;
        pendingCount: number;
        urgentCount: number;
        progressPercentage: number;
      };
      groupedByParty: Record<
        string,
        {
          partyKey: string;
          partyLabel: string;
          total: number;
          completed: number;
          progress: number;
          documents: KuaDocument[];
        }
      >;
      documents: KuaDocument[];
    }>
  >({
    queryKey: ["kua-documents"],
    queryFn: async () => {
      const res = await api.get("/kua");
      return res.data;
    },
  });

  const kuaData = data?.data;
  const summary = kuaData?.summary || {
    totalDocuments: 0,
    completedCount: 0,
    inProgressCount: 0,
    pendingCount: 0,
    urgentCount: 0,
    progressPercentage: 0,
  };
  const grouped = kuaData?.groupedByParty || {};
  const currentPartyGroup = grouped[selectedParty] || {
    total: 0,
    completed: 0,
    progress: 0,
    documents: [],
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<KuaDocFormData>({
    resolver: zodResolver(kuaDocSchema),
    defaultValues: {
      fromParty: "calon_pria",
      status: "pending",
      documentType: "persyaratan",
    },
  });

  const openAddModal = () => {
    setEditingDoc(null);
    reset({
      documentName: "",
      documentCode: "",
      fromParty: (selectedParty as any) || "calon_pria",
      status: "pending",
      deadline: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (doc: KuaDocument) => {
    setEditingDoc(doc);
    setValue("documentName", doc.documentName);
    setValue("documentCode", doc.documentCode || "");
    setValue("fromParty", doc.fromParty);
    setValue("status", doc.status);
    setValue(
      "deadline",
      doc.deadline ? new Date(doc.deadline).toISOString().split("T")[0] : ""
    );
    setValue("notes", doc.notes || "");
    setIsModalOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData: KuaDocFormData) => api.post("/kua", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kua-documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Dokumen berhasil ditambahkan!");
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error("Gagal menambahkan", { description: err.response?.data?.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: KuaDocFormData) => api.put(`/kua/${editingDoc?.id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kua-documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Status dokumen diperbarui!");
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error("Gagal memperbarui", { description: err.response?.data?.message });
    },
  });

  const toggleStatusDirectMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "in_progress" | "completed" }) =>
      api.put(`/kua/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kua-documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/kua/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kua-documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Dokumen dihapus!");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => api.post("/kua/reset"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kua-documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Daftar dokumen KUA di-reset ke 30 berkas standar!");
    },
  });

  const onSubmit = (formData: KuaDocFormData) => {
    if (editingDoc) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar
        title="Perizinan & Dokumen KUA"
        description="Panduan lengkap dan pelacak kelengkapan 30+ berkas persyaratan nikah resmi KUA Kemenag"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Reset ulang daftar berkas ke 30 dokumen standar KUA?")) {
                  resetMutation.mutate();
                }
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              isLoading={resetMutation.isPending}
            >
              Reset Dokumen
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={openAddModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Tambah Dokumen
            </Button>
          </div>
        }
      />

      {/* 1. Progress Banner */}
      <Card className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                Kelengkapan Administrasi
              </Badge>
              <span className="text-xs font-bold text-slate-800">
                {summary.completedCount} dari {summary.totalDocuments} Dokumen Lengkap
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Progress Dokumen KUA: {summary.progressPercentage}%
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Pastikan berkas fisik telah diverifikasi ke KUA paling lambat{" "}
              <strong className="text-rose-600 font-bold">H-10 hari kerja</strong> sebelum tanggal akad.
            </p>
          </div>

          <div className="w-full md:w-72 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Status Kelengkapan</span>
              <span className="text-sm font-black text-emerald-600">
                {summary.progressPercentage}%
              </span>
            </div>
            <ProgressBar value={summary.progressPercentage} colorVariant="emerald" size="md" />
          </div>
        </div>
      </Card>

      {/* 2. Official Procedure Guide Accordion */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="px-6 py-4 bg-slate-50/80 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none border-b border-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Panduan Langkah Pengurusan Pernikahan di KUA
              </h3>
              <p className="text-[11px] text-slate-500">
                Alur dari RT/RW, Kelurahan, Puskesmas hingga pendaftaran online SIMKAH
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 hidden sm:inline">
              {isGuideOpen ? "Tutup Panduan" : "Buka Panduan"}
            </span>
            {isGuideOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {isGuideOpen && (
          <div className="p-6 space-y-6 text-xs text-slate-700 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-sm">RT/RW & Kelurahan</h4>
                <p className="text-slate-600 leading-relaxed">
                  Minta Surat Pengantar RT/RW, lalu bawa ke Kelurahan untuk diterbitkan formulir model{" "}
                  <strong>N1</strong> (Pengantar Nikah), <strong>N2</strong> (Permohonan Kehendak), dan{" "}
                  <strong>N4</strong> (Persetujuan).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Puskesmas & Kesehatan</h4>
                <p className="text-slate-600 leading-relaxed">
                  Pemeriksaan kesehatan pranikah dan imunisasi TT (Tetanus Toksoid) untuk calon pengantin wanita di Puskesmas, serta pengisian aplikasi <strong>Elsimil BKKBN</strong>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Pendaftaran SIMKAH</h4>
                <p className="text-slate-600 leading-relaxed">
                  Daftar online di portal resmi{" "}
                  <a
                    href="https://simkah.kemenag.go.id"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    simkah.kemenag.go.id <ExternalLink className="w-3 h-3" />
                  </a>
                  , lalu bawa berkas fisik ke KUA untuk verifikasi dan penentuan jadwal akad.
                </p>
              </div>
            </div>

            {/* Important Notes Alert */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Ketentuan Biaya & Waktu KUA:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                  <li>
                    <strong>Gratis (Rp 0)</strong> jika akad nikah dilaksanakan di Kantor KUA pada hari dan jam kerja.
                  </li>
                  <li>
                    <strong>Biaya PNBP Rp 600.000</strong> jika akad nikah dilaksanakan di luar Kantor KUA (gedung/rumah) atau di luar hari/jam kerja. Pembayaran melalui kode billing bank persepsi.
                  </li>
                  <li>
                    Pendaftaran berkas paling lambat <strong>10 hari kerja</strong> sebelum pelaksanaan akad.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Party Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PARTIES.map((party) => {
          const count = grouped[party.id]?.total || 0;
          const comp = grouped[party.id]?.completed || 0;
          return (
            <button
              key={party.id}
              onClick={() => setSelectedParty(party.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedParty === party.id
                  ? "bg-[#E11D48] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{party.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  selectedParty === party.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {comp}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Document Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} height={80} rounded="2xl" />
          ))
        ) : currentPartyGroup.documents.length > 0 ? (
          currentPartyGroup.documents.map((doc) => (
            <Card
              key={doc.id}
              className={`p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                doc.isCompleted
                  ? "bg-emerald-50/20 border-emerald-200"
                  : doc.isOverdue || doc.isNearDeadline
                  ? "border-rose-200 bg-rose-50/20"
                  : "hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Status Dropdown selector */}
                <select
                  value={doc.status}
                  onChange={(e) =>
                    toggleStatusDirectMutation.mutate({
                      id: doc.id,
                      status: e.target.value as any,
                    })
                  }
                  className={`mt-0.5 text-xs font-bold rounded-lg px-2 py-1 border transition-all cursor-pointer ${
                    doc.status === "completed"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : doc.status === "in_progress"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                >
                  <option value="pending">❌ Belum</option>
                  <option value="in_progress">⏳ Proses</option>
                  <option value="completed">✅ Lengkap</option>
                </select>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-sm font-bold leading-snug ${
                        doc.isCompleted ? "line-through text-slate-500" : "text-slate-900"
                      }`}
                    >
                      {doc.documentName}
                    </h4>
                    {doc.documentCode && (
                      <Badge variant="blue" size="sm">
                        {doc.documentCode}
                      </Badge>
                    )}
                    {doc.isNearDeadline && !doc.isCompleted && (
                      <Badge variant="danger" size="sm" dot>
                        Deadline {doc.daysRemaining} hari lagi
                      </Badge>
                    )}
                    {doc.isOverdue && !doc.isCompleted && (
                      <Badge variant="danger" size="sm" dot>
                        Melewati Batas Waktu
                      </Badge>
                    )}
                  </div>

                  {doc.notes && (
                    <p className="text-xs text-slate-500 leading-relaxed">{doc.notes}</p>
                  )}

                  {doc.deadline && (
                    <p className="text-[11px] text-slate-400 font-medium pt-0.5">
                      📅 Target Selesai: {formatDateShort(doc.deadline)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <button
                  onClick={() => openEditModal(doc)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus dokumen "${doc.documentName}"?`)) {
                      deleteMutation.mutate(doc.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center text-slate-400">
            <p className="text-xs font-semibold">Belum ada dokumen pada kategori ini.</p>
          </Card>
        )}
      </div>

      {/* 5. Add / Edit Document Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoc ? "Edit Dokumen KUA" : "Tambah Dokumen Persyaratan"}
        description="Rincian berkas dan batas waktu pengurusan"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pihak Terkait
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
              {...register("fromParty")}
            >
              {PARTIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nama Dokumen"
            placeholder="Contoh: Akta Kelahiran, Surat N1, Pas Foto Biru"
            error={errors.documentName?.message}
            {...register("documentName")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Kode Surat (Opsional)"
              placeholder="Contoh: N1, N2, N4, N8"
              {...register("documentCode")}
            />

            <Input
              label="Target Tanggal Selesai (Deadline)"
              type="date"
              {...register("deadline")}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status Kelengkapan
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
              {...register("status")}
            >
              <option value="pending">❌ Belum Lengkap</option>
              <option value="in_progress">⏳ Dalam Proses Pengurusan</option>
              <option value="completed">✅ Sudah Lengkap & Terverifikasi</option>
            </select>
          </div>

          <Input
            label="Catatan atau Panduan Pengurusan"
            placeholder="Contoh: Membawa pengantar dari ketua RT dan RW"
            {...register("notes")}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingDoc ? "Simpan Perubahan" : "Tambahkan Dokumen"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
