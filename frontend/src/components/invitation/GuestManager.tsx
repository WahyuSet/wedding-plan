import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Download, Link2, Pencil, Plus, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { usePublicSettings } from "../../hooks/usePublicSettings.js";
import { api } from "../../lib/api.js";
import { GUEST_CATEGORIES, parseGuestLines, type GuestCategory } from "../../lib/guestImport.js";
import { guestKey, shareInvitationUrl } from "../../lib/invitationLinks.js";
import { buildInviteMessage, buildWaLink } from "../../lib/whatsapp.js";
import type { DigitalInvitation, InvitationGuest, InvitationRsvp } from "../../types/index.js";
import { Badge } from "../ui/Badge.js";
import { Button } from "../ui/Button.js";
import { Card, CardDescription, CardTitle } from "../ui/Card.js";
import { Modal } from "../ui/Modal.js";

const CATEGORY_LABEL: Record<GuestCategory, string> = {
  keluarga: "Keluarga",
  sahabat: "Sahabat",
  vip: "VIP",
  rekan_kerja: "Rekan Kerja",
};

type Filter = "semua" | "belum_rsvp" | "hadir" | "tidak_hadir" | "belum_dikirim";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "semua", label: "Semua tamu" },
  { id: "belum_rsvp", label: "Belum RSVP" },
  { id: "hadir", label: "Hadir" },
  { id: "tidak_hadir", label: "Berhalangan" },
  { id: "belum_dikirim", label: "Belum dikirimi undangan" },
];

const inputClass =
  "px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E11D48]";

interface GuestManagerProps {
  invitation: DigitalInvitation;
}

export const GuestManager: React.FC<GuestManagerProps> = ({ invitation }) => {
  const queryClient = useQueryClient();
  const { settings } = usePublicSettings();
  const guests = useMemo(() => invitation.guests ?? [], [invitation.guests]);
  const rsvps = useMemo(() => invitation.rsvps ?? [], [invitation.rsvps]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<GuestCategory>("sahabat");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [filter, setFilter] = useState<Filter>("semua");
  const [editing, setEditing] = useState<InvitationGuest | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["digital-invitation-config"] });
  const onError = (err: unknown, fallback: string) => {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    toast.error(message || fallback);
  };

  const rsvpByGuest = useMemo(() => {
    const map = new Map<string, InvitationRsvp>();
    rsvps.forEach((r) => r.guestId && map.set(r.guestId, r));
    return map;
  }, [rsvps]);

  const addMutation = useMutation({
    mutationFn: (payload: { name: string; category: GuestCategory; phone?: string }) =>
      api.post("/invitation/guests", payload),
    onSuccess: () => {
      refresh();
      setName("");
      setPhone("");
      toast.success("Tamu berhasil ditambahkan");
    },
    onError: (err) => onError(err, "Gagal menambah tamu"),
  });

  // Catatan: bar tambah-tamu TIDAK boleh dibungkus <form> karena sudah berada di dalam
  // <form> besar InvitationAdminPage. Form bersarang membuat event submit tidak pernah
  // sampai ke React (klik tombol memicu reload halaman penuh, bukan addMutation).
  const handleAddGuest = () => {
    if (!name.trim()) return toast.error("Masukkan nama tamu");
    addMutation.mutate({ name: name.trim(), category, ...(phone.trim() ? { phone: phone.trim() } : {}) });
  };
  const submitOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGuest();
    }
  };

  const bulkMutation = useMutation({
    mutationFn: (payload: { guests: ReturnType<typeof parseGuestLines>["guests"] }) =>
      api.post("/invitation/guests/bulk", payload),
    onSuccess: (res) => {
      refresh();
      setBulkText("");
      setShowBulk(false);
      toast.success(res.data.message || "Tamu berhasil ditambahkan");
    },
    onError: (err) => onError(err, "Gagal menambah tamu"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<Pick<InvitationGuest, "name" | "phone" | "category" | "isSent">>) =>
      api.patch(`/invitation/guests/${id}`, body),
    onSuccess: () => refresh(),
    onError: (err) => onError(err, "Gagal memperbarui tamu"),
  });

  const deleteGuestMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invitation/guests/${id}`),
    onSuccess: () => {
      refresh();
      toast.success("Tamu dihapus dari daftar");
    },
    onError: (err) => onError(err, "Gagal menghapus tamu"),
  });

  const deleteRsvpMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invitation/rsvps/${id}`),
    onSuccess: () => {
      refresh();
      toast.success("Ucapan berhasil dihapus");
    },
    onError: (err) => onError(err, "Gagal menghapus ucapan"),
  });

  const couple = [invitation.groomNickName, invitation.brideNickName].filter(Boolean).join(" & ") || "kami";

  const linkFor = (g: InvitationGuest) => shareInvitationUrl(invitation.slug, guestKey(g), settings.invitation_url);
  const messageFor = (g: InvitationGuest) => buildInviteMessage(g.name, linkFor(g), couple);

  const copyInvite = async (g: InvitationGuest) => {
    try {
      await navigator.clipboard.writeText(messageFor(g));
      toast.success("Teks undangan tersalin", { description: `Siap dikirim untuk ${g.name}` });
    } catch {
      toast.error("Tidak dapat menyalin ke clipboard");
    }
  };

  const sendWhatsApp = (g: InvitationGuest) => {
    const url = buildWaLink(g.phone, messageFor(g));
    if (!url) {
      toast.error("Nomor WhatsApp belum diisi atau tidak valid", { description: "Edit tamu untuk mengisi nomor." });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    if (!g.isSent) updateMutation.mutate({ id: g.id, isSent: true });
  };

  const exportCsv = async () => {
    try {
      const res = await api.get("/invitation/guests/export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `daftar-tamu-${invitation.slug}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      onError(err, "Gagal mengekspor daftar tamu");
    }
  };

  const stats = {
    total: guests.length,
    sent: guests.filter((g) => g.isSent).length,
    responded: guests.filter((g) => rsvpByGuest.has(g.id)).length,
    attending: rsvps
      .filter((r) => r.attendanceStatus === "hadir")
      .reduce((sum, r) => sum + (r.guestCount || 1), 0),
    declined: rsvps.filter((r) => r.attendanceStatus === "tidak_hadir").length,
  };

  const visibleGuests = guests.filter((g) => {
    const rsvp = rsvpByGuest.get(g.id);
    switch (filter) {
      case "belum_rsvp":
        return !rsvp;
      case "hadir":
        return rsvp?.attendanceStatus === "hadir";
      case "tidak_hadir":
        return rsvp?.attendanceStatus === "tidak_hadir";
      case "belum_dikirim":
        return !g.isSent;
      default:
        return true;
    }
  });

  const bulkPreview = useMemo(() => parseGuestLines(bulkText), [bulkText]);

  const statusBadge = (g: InvitationGuest) => {
    const rsvp = rsvpByGuest.get(g.id);
    if (!rsvp) return <Badge variant="neutral" size="sm">Belum RSVP</Badge>;
    if (rsvp.attendanceStatus === "hadir")
      return <Badge variant="success" size="sm">{`Hadir (${rsvp.guestCount})`}</Badge>;
    if (rsvp.attendanceStatus === "tidak_hadir") return <Badge variant="danger" size="sm">Berhalangan</Badge>;
    return <Badge variant="warning" size="sm">Ragu-ragu</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Tamu", value: stats.total },
          { label: "Undangan Terkirim", value: `${stats.sent}/${stats.total}` },
          { label: "Sudah RSVP", value: `${stats.responded}/${stats.total}` },
          { label: "Perkiraan Hadir", value: `${stats.attending} orang` },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-[11px] font-semibold text-slate-500">{item.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Daftar Tamu &amp; Tautan Personal</CardTitle>
            <CardDescription>
              Tiap tamu mendapat tautan unik. Nama otomatis muncul di undangan dan RSVP-nya tercatat atas nama tamu tersebut.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Users className="w-3.5 h-3.5" />}
              onClick={() => setShowBulk((v) => !v)}
            >
              Tambah Massal
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={exportCsv}
              disabled={guests.length === 0}
            >
              Ekspor CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_140px_auto] gap-2">
          <input
            className={inputClass}
            placeholder="Nama tamu (contoh: Bpk. Bambang Sutrisno)"
            aria-label="Nama tamu"
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={submitOnEnter}
          />
          <input
            className={inputClass}
            placeholder="No. WhatsApp (opsional)"
            aria-label="Nomor WhatsApp"
            inputMode="tel"
            maxLength={20}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={submitOnEnter}
          />
          <select
            className={inputClass}
            aria-label="Kategori tamu"
            value={category}
            onChange={(e) => setCategory(e.target.value as GuestCategory)}
          >
            {GUEST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            isLoading={addMutation.isPending}
            onClick={handleAddGuest}
          >
            Tambah
          </Button>
        </div>

        {showBulk && (
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <label htmlFor="bulk-guests" className="block text-xs font-semibold text-slate-700">
              Satu tamu per baris: <span className="font-mono">Nama, kategori, nomor WhatsApp</span> (kategori dan nomor opsional)
            </label>
            <textarea
              id="bulk-guests"
              rows={6}
              className={`${inputClass} w-full font-mono`}
              placeholder={"Bpk. Andi, keluarga, 0812-1111-2222\nIbu Rina, sahabat\nDoni, 0813-3333-4444"}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                {bulkPreview.guests.length} tamu terbaca
                {bulkPreview.skipped > 0 ? `, ${bulkPreview.skipped} baris dilewati` : ""}
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={bulkMutation.isPending}
                disabled={bulkPreview.guests.length === 0 || bulkPreview.guests.length > 300}
                onClick={() => bulkMutation.mutate({ guests: bulkPreview.guests })}
              >
                Tambahkan {bulkPreview.guests.length} Tamu
              </Button>
            </div>
          </div>
        )}

        {guests.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter daftar tamu">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                    filter === f.id
                      ? "bg-[#E11D48] text-white border-[#E11D48]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">Nama</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Terkirim</th>
                      <th className="p-3">RSVP</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleGuests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Tidak ada tamu pada filter ini.
                        </td>
                      </tr>
                    )}
                    {visibleGuests.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-bold text-slate-900">{g.name}</td>
                        <td className="p-3">
                          <Badge variant="neutral" size="sm">
                            {CATEGORY_LABEL[g.category as GuestCategory] ?? g.category}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-600">{g.phone || "-"}</td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            aria-label={`Tandai undangan ${g.name} sudah dikirim`}
                            checked={g.isSent}
                            onChange={(e) => updateMutation.mutate({ id: g.id, isSent: e.target.checked })}
                            className="w-4 h-4 accent-[#E11D48]"
                          />
                        </td>
                        <td className="p-3">{statusBadge(g)}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-[11px] py-1 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              leftIcon={<Send className="w-3 h-3" />}
                              onClick={() => sendWhatsApp(g)}
                            >
                              WhatsApp
                            </Button>
                            <button
                              type="button"
                              title="Salin teks undangan"
                              aria-label={`Salin teks undangan untuk ${g.name}`}
                              onClick={() => void copyInvite(g)}
                              className="text-slate-400 hover:text-slate-700 p-1.5"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit tamu"
                              aria-label={`Edit ${g.name}`}
                              onClick={() => setEditing(g)}
                              className="text-slate-400 hover:text-slate-700 p-1.5"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Hapus tamu"
                              aria-label={`Hapus ${g.name}`}
                              onClick={() => {
                                if (window.confirm(`Hapus ${g.name} dari daftar tamu?`)) deleteGuestMutation.mutate(g.id);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!invitation.isPublished && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            Undangan belum dipublikasikan, jadi tautan tamu belum bisa dibuka. Aktifkan &quot;Publikasikan undangan&quot; di tab Tema lalu simpan.
          </p>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Buku Tamu Online &amp; Ucapan Doa ({rsvps.length})</CardTitle>
            <CardDescription>Daftar konfirmasi kehadiran dan doa restu dari tamu undangan</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">{stats.attending} Hadir</Badge>
            <Badge variant="danger" size="sm">{stats.declined} Berhalangan</Badge>
          </div>
        </div>

        {rsvps.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">Belum ada ucapan atau konfirmasi RSVP dari tamu.</div>
        ) : (
          <div className="space-y-3">
            {rsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{rsvp.guestName}</h4>
                    <Badge
                      variant={
                        rsvp.attendanceStatus === "hadir" ? "success" : rsvp.attendanceStatus === "tidak_hadir" ? "danger" : "neutral"
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
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 break-words">
                      &quot;{rsvp.message}&quot;
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Hapus ucapan ini?")) deleteRsvpMutation.mutate(rsvp.id);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                  title="Hapus Ucapan"
                  aria-label={`Hapus ucapan dari ${rsvp.guestName}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <EditGuestModal
        guest={editing}
        isSaving={updateMutation.isPending}
        onClose={() => setEditing(null)}
        onSave={(values) =>
          updateMutation.mutate(
            { id: editing!.id, ...values },
            {
              onSuccess: () => {
                setEditing(null);
                toast.success("Tamu diperbarui");
              },
            }
          )
        }
      />
    </div>
  );
};

interface EditGuestModalProps {
  guest: InvitationGuest | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: { name: string; phone: string | null; category: InvitationGuest["category"] }) => void;
}

const EditGuestModal: React.FC<EditGuestModalProps> = ({ guest, isSaving, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<GuestCategory>("keluarga");
  const [loadedId, setLoadedId] = useState<string | null>(null);

  if (guest && guest.id !== loadedId) {
    setLoadedId(guest.id);
    setName(guest.name);
    setPhone(guest.phone ?? "");
    setCategory(guest.category);
  }
  if (!guest && loadedId) setLoadedId(null);

  // Catatan: EditGuestModal dirender inline (Modal tidak pakai portal) di dalam
  // GuestManager, yang ada di dalam <form> besar InvitationAdminPage. Form bersarang
  // membuat event submit tidak pernah sampai ke React — pakai <div> + onClick, bukan <form>.
  const handleSave = () => {
    if (!name.trim()) return toast.error("Nama tamu wajib diisi");
    onSave({ name: name.trim(), phone: phone.trim() || null, category });
  };
  const submitOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal isOpen={Boolean(guest)} onClose={onClose} title="Edit Tamu" maxWidth="sm">
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="edit-guest-name" className="block text-xs font-semibold text-slate-700">Nama</label>
          <input id="edit-guest-name" className={`${inputClass} w-full`} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={submitOnEnter} />
        </div>
        <div className="space-y-1">
          <label htmlFor="edit-guest-phone" className="block text-xs font-semibold text-slate-700">No. WhatsApp</label>
          <input id="edit-guest-phone" className={`${inputClass} w-full`} inputMode="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={submitOnEnter} />
        </div>
        <div className="space-y-1">
          <label htmlFor="edit-guest-category" className="block text-xs font-semibold text-slate-700">Kategori</label>
          <select id="edit-guest-category" className={`${inputClass} w-full`} value={category} onChange={(e) => setCategory(e.target.value as GuestCategory)}>
            {GUEST_CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Batal</Button>
          <Button type="button" variant="primary" size="sm" isLoading={isSaving} leftIcon={<Check className="w-3.5 h-3.5" />} onClick={handleSave}>
            Simpan
          </Button>
        </div>
      </div>
    </Modal>
  );
};
