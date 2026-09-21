export interface SeserahanTemplateItem {
  itemName: string;
  category: string;
  estimatedPrice: number;
  quantity: number;
  giver: "groom" | "bride";
  notes?: string;
}

export const SESERAHAN_TEMPLATES: SeserahanTemplateItem[] = [
  // Ibadah
  {
    itemName: "Set Perlengkapan Ibadah (Mukena, Sajadah, Al-Qur'an, Tasbih)",
    category: "ibadah",
    estimatedPrice: 750000,
    quantity: 1,
    giver: "groom",
    notes: "Simbol komitmen membimbing ibadah rumah tangga",
  },

  // Perhiasan & Mahar
  {
    itemName: "Set Perhiasan Emas / Berlian (Kalung, Gelang, Anting, Cincin)",
    category: "perhiasan",
    estimatedPrice: 5000000,
    quantity: 1,
    giver: "groom",
    notes: "Disesuaikan dengan kesepakatan keluarga",
  },

  // Pakaian & Busana
  {
    itemName: "Bahan Kebaya / Kain Batik Tradisional",
    category: "pakaian",
    estimatedPrice: 850000,
    quantity: 1,
    giver: "groom",
    notes: "Kain songket atau batik tulis premium",
  },
  {
    itemName: "Set Pakaian Kerja / Formal Wanita",
    category: "pakaian",
    estimatedPrice: 650000,
    quantity: 1,
    giver: "groom",
    notes: "Blazer atau dress formal",
  },
  {
    itemName: "Set Pakaian Kasual / Santai",
    category: "pakaian",
    estimatedPrice: 450000,
    quantity: 1,
    giver: "groom",
    notes: "Baju sehari-hari yang nyaman",
  },
  {
    itemName: "Set Pakaian Dalam & Lingerie",
    category: "pakaian",
    estimatedPrice: 500000,
    quantity: 1,
    giver: "groom",
    notes: "Dikemas tertutup dalam kotak berhias",
  },
  {
    itemName: "Sepatu / High Heels Pesta",
    category: "pakaian",
    estimatedPrice: 750000,
    quantity: 1,
    giver: "groom",
    notes: "Sesuai ukuran kaki mempelai wanita",
  },
  {
    itemName: "Tas Tangan / Handbag Pesta",
    category: "pakaian",
    estimatedPrice: 1200000,
    quantity: 1,
    giver: "groom",
    notes: "Warna netral yang serasi dengan busana",
  },

  // Kosmetik & Skincare
  {
    itemName: "Set Skincare Lengkap (Cleanser, Toner, Serum, Moisturizer, Sunscreen)",
    category: "kosmetik",
    estimatedPrice: 1500000,
    quantity: 1,
    giver: "groom",
    notes: "Gunakan brand yang biasa dipakai mempelai wanita",
  },
  {
    itemName: "Set Makeup & Parfum Premium",
    category: "kosmetik",
    estimatedPrice: 1200000,
    quantity: 1,
    giver: "groom",
    notes: "Lipstick, cushion, eyeshadow palette, dan parfum favorit",
  },

  // Perlengkapan Mandi & Body Care
  {
    itemName: "Set Body Wash, Body Scrub, Body Lotion & Handuk Pasangan",
    category: "perlengkapan_mandi",
    estimatedPrice: 600000,
    quantity: 1,
    giver: "groom",
    notes: "Handuk bordir nama pengantin",
  },

  // Peralatan Rumah & Sprei
  {
    itemName: "Set Bedcover & Sprei Sutra/Katun Jepang",
    category: "peralatan_rumah",
    estimatedPrice: 850000,
    quantity: 1,
    giver: "groom",
    notes: "Ukuran King Size 180x200",
  },

  // Makanan & Buah
  {
    itemName: "Parsel Buah Segar Pilihan (Apel, Anggur, Pir, Jeruk)",
    category: "makanan_minuman",
    estimatedPrice: 400000,
    quantity: 1,
    giver: "groom",
    notes: "Simbol kemakmuran dan kesuburan",
  },
  {
    itemName: "Kue Tradisional & Jajanan Pasar (Wajik, Jadah, Lapis)",
    category: "makanan_minuman",
    estimatedPrice: 350000,
    quantity: 1,
    giver: "groom",
    notes: "Tekstur lengket melambangkan kelanggengan hubungan",
  },
  {
    itemName: "Kue Bolu / Cake Modern Hias",
    category: "makanan_minuman",
    estimatedPrice: 300000,
    quantity: 1,
    giver: "groom",
    notes: "Hiasan tema wedding",
  },

  // Balasan dari Calon Wanita untuk Pria (Angsul-angsul)
  {
    itemName: "Set Baju Koko, Sarung & Sajadah Pria",
    category: "ibadah",
    estimatedPrice: 650000,
    quantity: 1,
    giver: "bride",
    notes: "Balasan seserahan untuk mempelai pria",
  },
  {
    itemName: "Set Kemeja Kerja, Dasi & Ikat Pinggang Kulit",
    category: "pakaian",
    estimatedPrice: 800000,
    quantity: 1,
    giver: "bride",
    notes: "Pakaian formal kerja",
  },
  {
    itemName: "Sepatu Pantofel Kulit & Kaos Kaki",
    category: "pakaian",
    estimatedPrice: 900000,
    quantity: 1,
    giver: "bride",
    notes: "Ukuran sepatu mempelai pria",
  },
  {
    itemName: "Parfum & Grooming Kit Pria (Pomade, Shaver, Face Wash)",
    category: "kosmetik",
    estimatedPrice: 750000,
    quantity: 1,
    giver: "bride",
    notes: "Wewangian maskulin favorit",
  },
  {
    itemName: "Jam Tangan Pria",
    category: "perhiasan",
    estimatedPrice: 1500000,
    quantity: 1,
    giver: "bride",
    notes: "Aksesoris formal elegan",
  },
];
