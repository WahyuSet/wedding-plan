export interface ImagePresetItem {
  id: string;
  title: string;
  category: "cover" | "groom" | "bride" | "gallery";
  url: string;
  thumbnail: string;
  themeRecommendation?: "noir-calla" | "chalk-and-vow" | "nocturne-botanica" | "all";
}

// ─────────────────────────────────────────────
// Master Presets Curated Library (High-Res)
// ─────────────────────────────────────────────

export const MASTER_COVER_PRESETS: ImagePresetItem[] = [
  {
    id: "cover-noir-1",
    title: "Noir Editorial Monogram",
    category: "cover",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80",
    themeRecommendation: "noir-calla",
  },
  {
    id: "cover-noir-2",
    title: "Moody Dramatic Black Tie",
    category: "cover",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&auto=format&fit=crop&q=85",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&auto=format&fit=crop&q=80",
    themeRecommendation: "noir-calla",
  },
  {
    id: "cover-chalk-1",
    title: "Fine-Art Chalk & White Florals",
    category: "cover",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&auto=format&fit=crop&q=85",
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&auto=format&fit=crop&q=80",
    themeRecommendation: "chalk-and-vow",
  },
  {
    id: "cover-chalk-2",
    title: "Romantic Sunlight Veil",
    category: "cover",
    url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1600&auto=format&fit=crop&q=85",
    thumbnail: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&auto=format&fit=crop&q=80",
    themeRecommendation: "chalk-and-vow",
  },
  {
    id: "cover-nocturne-1",
    title: "Nocturne Botanical Greenhouse",
    category: "cover",
    url: "https://images.unsplash.com/photo-1544077960-604201fe74bc?w=1600&auto=format&fit=crop&q=85",
    thumbnail: "https://images.unsplash.com/photo-1544077960-604201fe74bc?w=300&auto=format&fit=crop&q=80",
    themeRecommendation: "nocturne-botanica",
  },
  {
    id: "cover-nocturne-2",
    title: "Deep Emerald Forest Embrace",
    category: "cover",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1600&auto=format&fit=crop&q=85",
    thumbnail: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&auto=format&fit=crop&q=80",
    themeRecommendation: "nocturne-botanica",
  },
];

export const MASTER_GROOM_PRESETS: ImagePresetItem[] = [
  {
    id: "groom-tuxedo",
    title: "Tuxedo Hitam Modern",
    category: "groom",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "groom-classic-suit",
    title: "Jas Dasi Kupu Klasik",
    category: "groom",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "groom-outdoor-editorial",
    title: "Jas Charcoal Elegan",
    category: "groom",
    url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "groom-traditional",
    title: "Jas Tradisional Bersahaja",
    category: "groom",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
  },
];

export const MASTER_BRIDE_PRESETS: ImagePresetItem[] = [
  {
    id: "bride-white-gown",
    title: "Gaun Putih Modern & Veil",
    category: "bride",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "bride-minimalist-chic",
    title: "Gaun Silk Minimalis",
    category: "bride",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "bride-fineart-veil",
    title: "Klasik Fine Art Rias Pengantin",
    category: "bride",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "bride-botanical-boho",
    title: "Gaun Renda Natural",
    category: "bride",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
  },
];

export const MASTER_GALLERY_PRESETS: ImagePresetItem[] = [
  {
    id: "gallery-1",
    title: "Momen Cincin & Janji",
    category: "gallery",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "gallery-2",
    title: "Tatapan Penuh Makna",
    category: "gallery",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "gallery-3",
    title: "Langkah Bersama",
    category: "gallery",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "gallery-4",
    title: "Buket Bunga Bahagia",
    category: "gallery",
    url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "gallery-5",
    title: "Romansa Senja",
    category: "gallery",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "gallery-6",
    title: "Dekapan Kehangatan",
    category: "gallery",
    url: "https://images.unsplash.com/photo-1544077960-604201fe74bc?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1544077960-604201fe74bc?w=300&auto=format&fit=crop&q=80",
  },
];
