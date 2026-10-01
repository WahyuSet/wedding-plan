import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Music, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api.js";
import { Card, CardDescription, CardTitle } from "../ui/Card.js";

interface Asset {
  id: string;
  kind: "image" | "audio";
  size: number;
  url: string;
  createdAt: string;
}

interface AssetList {
  assets: Asset[];
  usage: { count: number; bytes: number; maxCount: number; maxBytes: number };
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return bytes === 0 ? "0 KB" : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const UploadManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery<AssetList>({
    queryKey: ["invitation-assets"],
    queryFn: async () => (await api.get("/invitation/uploads")).data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invitation/uploads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation-assets"] });
      toast.success("File dihapus");
    },
    onError: () => toast.error("Gagal menghapus file"),
  });

  if (!data) return null;
  const { assets, usage } = data;

  return (
    <Card className="p-6 space-y-4">
      <div>
        <CardTitle>File Unggahan Saya</CardTitle>
        <CardDescription>
          {usage.count}/{usage.maxCount} file, {formatBytes(usage.bytes)} dari {formatBytes(usage.maxBytes)}. Hapus file yang sudah tidak dipakai agar kuota tidak penuh.
        </CardDescription>
      </div>

      {assets.length === 0 ? (
        <p className="text-xs text-slate-400">Belum ada file yang diunggah.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {assets.map((asset) => (
            <li key={asset.id} className="relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
              {asset.kind === "image" ? (
                <img src={asset.url} alt="Foto unggahan" loading="lazy" className="w-full h-24 object-cover" />
              ) : (
                <div className="w-full h-24 flex items-center justify-center text-slate-400">
                  <Music className="w-6 h-6" />
                </div>
              )}
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <span className="text-[11px] text-slate-500">{formatBytes(asset.size)}</span>
                <button
                  type="button"
                  aria-label="Hapus file"
                  onClick={() => {
                    if (window.confirm("Hapus file ini? Jika masih dipakai di undangan, gambar/musiknya akan hilang.")) {
                      deleteMutation.mutate(asset.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
