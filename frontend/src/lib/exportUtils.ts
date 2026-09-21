import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { BudgetItem, BudgetSummary, WeddingProfile, SeserahanItem } from "../types/index.js";
import { formatRupiah, formatDateIndo } from "./utils.js";

const categoryNames: Record<string, string> = {
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

export const exportBudgetPDF = (
  items: BudgetItem[],
  summary: BudgetSummary,
  profile: WeddingProfile | null
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header Banner
  doc.setFillColor(225, 29, 72); // Rose primary
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN ANGGARAN PERNIKAHAN", 14, 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const coupleName = `${profile?.groomName || "Mempelai Pria"} & ${profile?.brideName || "Mempelai Wanita"}`;
  const weddingDateStr = profile?.weddingDate ? formatDateIndo(profile.weddingDate) : "-";
  doc.text(`${coupleName} • Tanggal: ${weddingDateStr}`, 14, 19);

  // Financial Summary Cards Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 28, 3, 3, "FD");

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.text("TARGET ANGGARAN", 20, 39);
  doc.text("TOTAL BIAYA", 65, 39);
  doc.text("SUDAH DIBAYAR", 110, 39);
  doc.text("SISA BELUM LUNAS", 155, 39);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(summary.totalBudget), 20, 48);
  doc.text(formatRupiah(summary.totalActual || summary.totalEstimated), 65, 48);
  doc.setTextColor(16, 185, 129);
  doc.text(formatRupiah(summary.totalPaid), 110, 48);

  const unpaidColor = summary.totalUnpaid > 0 ? [239, 68, 68] : [100, 116, 139];
  doc.setTextColor(unpaidColor[0], unpaidColor[1], unpaidColor[2]);
  doc.text(formatRupiah(summary.totalUnpaid), 155, 48);

  // Table of Items
  const tableRows = items.map((item, index) => {
    const totalCost = item.actualCost || item.estimatedCost || 0;
    const paid =
      item.paymentStatus === "paid"
        ? totalCost
        : item.paymentStatus === "dp"
        ? item.amountPaid || 0
        : 0;
    const sisa = Math.max(0, totalCost - paid);

    return [
      index + 1,
      item.itemName,
      categoryNames[item.category] || item.category,
      item.vendorName || "-",
      formatRupiah(totalCost),
      formatRupiah(paid),
      formatRupiah(sisa),
      item.paymentStatus === "paid" ? "Lunas" : item.paymentStatus === "dp" ? "DP" : "Belum",
    ];
  });

  autoTable(doc, {
    startY: 66,
    head: [["No", "Nama Item", "Kategori", "Vendor", "Total Biaya", "Dibayar / DP", "Sisa", "Status"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [225, 29, 72],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 42 },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 22, halign: "right" },
      7: { cellWidth: 14, halign: "center" },
    },
    foot: [
      [
        "",
        "TOTAL",
        "",
        "",
        formatRupiah(summary.totalActual || summary.totalEstimated),
        formatRupiah(summary.totalPaid),
        formatRupiah(summary.totalUnpaid),
        "",
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8.5,
    },
  });

  // Footer note
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dicetak otomatis oleh WeddingPlan pada ${new Date().toLocaleDateString("id-ID")} • Halaman ${i} dari ${pageCount}`,
      14,
      287
    );
  }

  doc.save(`Laporan_Anggaran_Pernikahan_${profile?.groomName || "Wedding"}.pdf`);
};

export const exportBudgetExcel = (
  items: BudgetItem[],
  summary: BudgetSummary,
  profile: WeddingProfile | null
) => {
  const wb = XLSX.utils.book_new();

  // Summary Data
  const summaryData = [
    ["LAPORAN PERENCANAAN ANGGARAN & PELUNASAN PERNIKAHAN"],
    ["Pasangan", `${profile?.groomName || "-"} & ${profile?.brideName || "-"}`],
    ["Tanggal Pernikahan", profile?.weddingDate ? formatDateIndo(profile.weddingDate) : "-"],
    ["Lokasi / Venue", profile?.venue || "-"],
    ["Tanggal Cetak", new Date().toLocaleDateString("id-ID")],
    [],
    ["RINGKASAN KEUANGAN"],
    ["Target Total Anggaran (Pagu)", summary.totalBudget],
    ["Total Komitmen Biaya", summary.totalActual || summary.totalEstimated],
    ["Total Kas Sudah Dibayar (DP + Lunas)", summary.totalPaid],
    ["Sisa Tagihan Belum Lunas (Hutang Vendor)", summary.totalUnpaid],
    ["Sisa Pagu Anggaran", summary.remainingBudget],
    [],
    ["RINCIAN PENGELUARAN & DP VENDOR"],
    [
      "No",
      "Nama Item / Kebutuhan",
      "Kategori",
      "Vendor",
      "Total Biaya (Rp)",
      "Sudah Dibayar / DP (Rp)",
      "Sisa Pelunasan (Rp)",
      "Status Bayar",
      "Catatan",
    ],
    ...items.map((item, idx) => {
      const totalCost = item.actualCost || item.estimatedCost || 0;
      const paid =
        item.paymentStatus === "paid"
          ? totalCost
          : item.paymentStatus === "dp"
          ? item.amountPaid || 0
          : 0;
      const sisa = Math.max(0, totalCost - paid);

      return [
        idx + 1,
        item.itemName,
        categoryNames[item.category] || item.category,
        item.vendorName || "-",
        totalCost,
        paid,
        sisa,
        item.paymentStatus === "paid" ? "LUNAS" : item.paymentStatus === "dp" ? "DP" : "BELUM BAYAR",
        item.notes || "-",
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(summaryData);

  ws["!cols"] = [
    { wch: 5 },   // No
    { wch: 32 },  // Nama Item
    { wch: 24 },  // Kategori
    { wch: 24 },  // Vendor
    { wch: 18 },  // Total Biaya
    { wch: 22 },  // Sudah Dibayar / DP
    { wch: 20 },  // Sisa Pelunasan
    { wch: 16 },  // Status Bayar
    { wch: 35 },  // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Anggaran Pernikahan");
  XLSX.writeFile(wb, `Anggaran_Pernikahan_${profile?.groomName || "Wedding"}.xlsx`);
};

const seserahanCategoryNames: Record<string, string> = {
  ibadah: "Perlengkapan Ibadah",
  perhiasan: "Perhiasan & Mahar",
  pakaian: "Pakaian & Aksesoris",
  kosmetik: "Kosmetik & Skincare",
  perlengkapan_mandi: "Perlengkapan Mandi",
  peralatan_rumah: "Peralatan Rumah / Sprei",
  makanan_minuman: "Makanan & Buah",
  lainnya: "Lain-lain",
};

export const exportSeserahanExcel = (
  items: SeserahanItem[],
  profile: WeddingProfile | null
) => {
  const wb = XLSX.utils.book_new();

  const data = [
    ["DAFTAR SESERAHAN & HANTARAN PERNIKAHAN"],
    ["Pasangan", `${profile?.groomName || "-"} & ${profile?.brideName || "-"}`],
    ["Tanggal Cetak", new Date().toLocaleDateString("id-ID")],
    [],
    // Header kolom — 100% cocok dan selaras dengan field di Web
    [
      "No",
      "Nama Item",
      "Kategori",
      "Merk / Brand",
      "Pemberi",
      "Jumlah (Qty)",
      "Harga / Nilai (Rp)",
      "Status Kesiapan",
      "Link Produk",
      "Catatan",
    ],
    ...items.map((item, idx) => [
      idx + 1,
      item.itemName,
      seserahanCategoryNames[item.category] || item.category,
      item.brand || "-",
      item.giver === "groom" ? "Mempelai Pria → Wanita" : "Mempelai Wanita → Pria",
      item.quantity,
      item.actualPrice || item.estimatedPrice || 0, // Nilai harga tunggal yang selaras dengan web
      item.isPrepared ? "Sudah Siap ✓" : "Belum Siap",
      item.link || "-",
      item.notes || "-",
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Lebar kolom agar tampilan Excel rapi dan mudah dibaca
  ws["!cols"] = [
    { wch: 5 },   // No
    { wch: 32 },  // Nama Item
    { wch: 25 },  // Kategori
    { wch: 20 },  // Merk / Brand
    { wch: 28 },  // Pemberi
    { wch: 12 },  // Jumlah (Qty)
    { wch: 20 },  // Harga / Nilai (Rp)
    { wch: 16 },  // Status Kesiapan
    { wch: 45 },  // Link Produk
    { wch: 35 },  // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Seserahan");
  XLSX.writeFile(wb, `Daftar_Seserahan_${profile?.groomName || "Wedding"}.xlsx`);
};
