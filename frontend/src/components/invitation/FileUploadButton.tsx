import React, { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api.js";
import { cn } from "../../lib/utils.js";

const LIMITS = {
  image: { bytes: 5 * 1024 * 1024, accept: "image/jpeg,image/png,image/webp", label: "5 MB" },
  audio: { bytes: 10 * 1024 * 1024, accept: "audio/mpeg,.mp3", label: "10 MB" },
} as const;

interface FileUploadButtonProps {
  kind: "image" | "audio";
  label?: string;
  multiple?: boolean;
  className?: string;
  onUploaded: (url: string) => void;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  kind,
  label,
  multiple = false,
  className,
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const limit = LIMITS[kind];

  const uploadOne = async (file: File): Promise<void> => {
    if (file.size > limit.bytes) {
      toast.error(`${file.name}: ukuran maksimal ${limit.label}`);
      return;
    }
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await api.post("/invitation/uploads", form, { headers: { "Content-Type": "multipart/form-data" } });
      onUploaded(res.data.data.url as string);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || `Gagal mengunggah ${file.name}`);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setIsUploading(true);
    for (const file of files) await uploadOne(file);
    setIsUploading(false);
    queryClient.invalidateQueries({ queryKey: ["invitation-assets"] });
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={limit.accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/40",
          className
        )}
      >
        {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        <span>{isUploading ? "Mengunggah..." : label ?? (kind === "image" ? "Unggah Foto" : "Unggah MP3")}</span>
      </button>
    </>
  );
};
