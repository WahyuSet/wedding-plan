import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Clock,
  Plus,
  RotateCcw,
  CheckCircle2,
  Circle,
  Calendar,
  User,
  AlertCircle,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { OperasionalTask, ApiResponse } from "../types/index.js";
import { Topbar } from "../components/layout/Topbar.js";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Input } from "../components/ui/Input.js";
import { Modal } from "../components/ui/Modal.js";
import { ProgressBar } from "../components/ui/ProgressBar.js";
import { Skeleton } from "../components/ui/Skeleton.js";

const PHASES = [
  { id: "h90", title: "1. Persiapan Awal (H-90 s/d H-31)", icon: "🗓️" },
  { id: "h30", title: "2. Persiapan Intensif (H-30 s/d H-8)", icon: "📋" },
  { id: "h7", title: "3. Final Countdown (H-7 s/d H-1)", icon: "⏳" },
  { id: "hariH", title: "4. Hari-H Rundown & Operasional", icon: "🎊" },
  { id: "pascaNikah", title: "5. Pasca Pernikahan", icon: "🌙" },
];

const taskSchema = z.object({
  taskName: z.string().min(1, "Nama tugas wajib diisi"),
  phase: z.enum(["h90", "h30", "h7", "hariH", "pascaNikah"]),
  scheduledTime: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  isDone: z.boolean().default(false),
  notes: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const OperasionalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({
    h90: true,
    h30: true,
    h7: true,
    hariH: true,
    pascaNikah: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OperasionalTask | null>(null);

  // Fetch Tasks
  const { data, isLoading } = useQuery<
    ApiResponse<{
      summary: {
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        progressPercentage: number;
      };
      groupedByPhase: Record<
        string,
        {
          phaseKey: string;
          phaseName: string;
          total: number;
          completed: number;
          progress: number;
          tasks: OperasionalTask[];
        }
      >;
      tasks: OperasionalTask[];
    }>
  >({
    queryKey: ["operasional-tasks"],
    queryFn: async () => {
      const res = await api.get("/operasional");
      return res.data;
    },
  });

  const operasionalData = data?.data;
  const summary = operasionalData?.summary || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    progressPercentage: 0,
  };
  const grouped = operasionalData?.groupedByPhase || {};

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      phase: "h90",
      priority: "medium",
      isDone: false,
    },
  });

  const togglePhaseAccordion = (phaseId: string) => {
    setOpenPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const openAddModal = (phaseId?: string) => {
    setEditingTask(null);
    reset({
      taskName: "",
      phase: (phaseId as any) || "h90",
      scheduledTime: "",
      assignedTo: "",
      priority: "medium",
      isDone: false,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: OperasionalTask) => {
    setEditingTask(task);
    setValue("taskName", task.taskName);
    setValue("phase", task.phase);
    setValue("scheduledTime", task.scheduledTime || "");
    setValue("assignedTo", task.assignedTo || "");
    setValue("priority", task.priority);
    setValue("isDone", task.isDone);
    setValue("notes", task.notes || "");
    setIsModalOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData: TaskFormData) => api.post("/operasional", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operasional-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Tugas operasional berhasil ditambahkan!");
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error("Gagal menambahkan tugas", { description: err.response?.data?.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: TaskFormData) =>
      api.put(`/operasional/${editingTask?.id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operasional-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Tugas operasional berhasil diperbarui!");
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error("Gagal memperbarui tugas", { description: err.response?.data?.message });
    },
  });

  const toggleDoneMutation = useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
      api.put(`/operasional/${id}`, { isDone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operasional-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/operasional/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operasional-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Tugas dihapus!");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => api.post("/operasional/reset"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operasional-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Rundown di-reset ke 24 template tugas standar!");
    },
  });

  const onSubmit = (formData: TaskFormData) => {
    if (editingTask) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar
        title="Operasional & Rundown Hari-H"
        description="Jadwal persiapan timeline pernikahan dan susunan acara operasional hari pelaksanaan"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Reset ulang seluruh tugas ke template standar pernikahan?")) {
                  resetMutation.mutate();
                }
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              isLoading={resetMutation.isPending}
            >
              Reset Template
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openAddModal()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Tambah Tugas
            </Button>
          </div>
        }
      />

      {/* 1. Progress Banner */}
      <Card className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border border-blue-200/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">
                Timeline Operasional
              </Badge>
              <span className="text-xs font-bold text-slate-800">
                {summary.completedTasks} dari {summary.totalTasks} Agenda Selesai
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Kesiapan Hari Pernikahan: {summary.progressPercentage}%
            </h2>
            <p className="text-xs text-slate-500">
              Pantau jalannya persiapan dari H-90 hingga hari-H dan urusan administrasi pasca nikah.
            </p>
          </div>

          <div className="w-full md:w-72 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Selesai</span>
              <span className="text-sm font-black text-blue-600">
                {summary.progressPercentage}%
              </span>
            </div>
            <ProgressBar value={summary.progressPercentage} colorVariant="blue" size="md" />
          </div>
        </div>
      </Card>

      {/* 2. Phases Timeline Accordions */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} height={120} rounded="2xl" />
          ))
        ) : (
          PHASES.map((phase) => {
            const phaseGroup = grouped[phase.id] || {
              total: 0,
              completed: 0,
              progress: 0,
              tasks: [],
            };
            const isOpen = openPhases[phase.id];

            return (
              <div
                key={phase.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => togglePhaseAccordion(phase.id)}
                  className="px-6 py-4 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{phase.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{phase.title}</h3>
                      <p className="text-[11px] text-slate-500">
                        {phaseGroup.completed} dari {phaseGroup.total} tugas selesai ({phaseGroup.progress}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24 hidden sm:block">
                      <ProgressBar value={phaseGroup.progress} size="sm" colorVariant="blue" showPercentage={false} />
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="p-4 sm:p-6 space-y-3">
                    {phaseGroup.tasks.length > 0 ? (
                      phaseGroup.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            task.isDone
                              ? "bg-slate-50/60 border-slate-200/60 text-slate-400"
                              : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-start gap-3.5 flex-1">
                            <button
                              onClick={() =>
                                toggleDoneMutation.mutate({
                                  id: task.id,
                                  isDone: !task.isDone,
                                })
                              }
                              className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              {task.isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <p
                                className={`text-sm font-bold leading-snug ${
                                  task.isDone ? "line-through text-slate-500" : "text-slate-900"
                                }`}
                              >
                                {task.taskName}
                              </p>
                              {task.notes && (
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {task.notes}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                                {task.scheduledTime && (
                                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                    ⏰ {task.scheduledTime} WIB
                                  </span>
                                )}
                                {task.assignedTo && (
                                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                                    <User className="w-3 h-3 text-slate-400" />
                                    {task.assignedTo}
                                  </span>
                                )}
                                <Badge
                                  variant={
                                    task.priority === "high"
                                      ? "rose"
                                      : task.priority === "medium"
                                      ? "gold"
                                      : "neutral"
                                  }
                                  size="sm"
                                >
                                  {task.priority === "high"
                                    ? "Prioritas Tinggi"
                                    : task.priority === "medium"
                                    ? "Sedang"
                                    : "Rendah"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus tugas "${task.taskName}"?`)) {
                                  deleteMutation.mutate(task.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4 italic">
                        Belum ada tugas pada fase ini.
                      </p>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddModal(phase.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Tambah Tugas di Fase Ini
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Tugas Operasional" : "Tambah Tugas Operasional Baru"}
        description="Tentukan waktu pelaksanaan dan penanggung jawab rundown acara"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fase Timeline
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
              {...register("phase")}
            >
              {PHASES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nama Tugas / Agenda"
            placeholder="Contoh: 08:00 — Ijab Qabul & Akad Nikah"
            error={errors.taskName?.message}
            {...register("taskName")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Jam Pelaksanaan (Opsional)"
              placeholder="Contoh: 08:00 WIB"
              {...register("scheduledTime")}
            />

            <Input
              label="Penanggung Jawab / PIC"
              placeholder="Contoh: WO, Keluarga Pria, MC"
              {...register("assignedTo")}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tingkat Prioritas
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
              {...register("priority")}
            >
              <option value="high">Prioritas Tinggi (Wajib & Krusial)</option>
              <option value="medium">Prioritas Sedang (Penting)</option>
              <option value="low">Prioritas Rendah (Opsional)</option>
            </select>
          </div>

          <Input
            label="Catatan atau Detail Tambahan"
            placeholder="Contoh: Pastikan mic penghulu dan saksi sudah dites sebelum mulai"
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
              {editingTask ? "Simpan Perubahan" : "Tambahkan Tugas"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
