import React, { useState } from "react";
import { X, Check, Image as ImageIcon, Sparkles } from "lucide-react";
import {
  ImagePresetItem,
  MASTER_COVER_PRESETS,
  MASTER_GROOM_PRESETS,
  MASTER_BRIDE_PRESETS,
  MASTER_GALLERY_PRESETS,
} from "../../lib/invitationPresets.js";
import { Button } from "../ui/Button.js";

interface ImagePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: "cover" | "groom" | "bride" | "gallery";
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export const ImagePresetModal: React.FC<ImagePresetModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  onSelect,
  currentUrl,
}) => {
  const [activeCategory, setActiveCategory] = useState<"cover" | "groom" | "bride" | "gallery">(category);
  const [customInputUrl, setCustomInputUrl] = useState("");

  if (!isOpen) return null;

  let presets: ImagePresetItem[] = [];
  if (activeCategory === "cover") presets = MASTER_COVER_PRESETS;
  else if (activeCategory === "groom") presets = MASTER_GROOM_PRESETS;
  else if (activeCategory === "bride") presets = MASTER_BRIDE_PRESETS;
  else if (activeCategory === "gallery") presets = MASTER_GALLERY_PRESETS;

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-400">Pilih dari Master Data Foto Berkualitas Tinggi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "cover", label: "🖼️ Sampul & Background" },
            { id: "groom", label: "👨 Mempelai Pria" },
            { id: "bride", label: "👩 Mempelai Wanita" },
            { id: "gallery", label: "📷 Prewedding Galeri" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Presets Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {presets.map((item) => {
            const isSelected = currentUrl === item.url;
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item.url)}
                className={`group relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[#E11D48] shadow-md ring-2 ring-[#E11D48]/20"
                    : "border-slate-200 hover:border-slate-400 hover:shadow-sm"
                }`}
              >
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-white">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Klik untuk pasang</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom URL Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            className="flex-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            placeholder="Atau tempel URL gambar custom Anda sendiri (https://...)"
            value={customInputUrl}
            onChange={(e) => setCustomInputUrl(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (!customInputUrl.trim()) return;
              handleSelect(customInputUrl.trim());
            }}
          >
            Gunakan Link Ini
          </Button>
        </div>
      </div>
    </div>
  );
};
