import type { InvitationTone } from "../../../types/index.js";

export interface InvitationCopy {
  badge: string;
  coupleIntro: string;
  ceremonyLabel: string;
  receptionLabel: string;
  giftIntro: string;
  thanks: string;
}

const COPY: Record<InvitationTone, InvitationCopy> = {
  islami: {
    badge: "Walimatul 'Ursy",
    coupleIntro: "Dengan memohon rahmat dan ridho Allah SWT",
    ceremonyLabel: "Akad Nikah",
    receptionLabel: "Resepsi Pernikahan",
    giftIntro:
      "Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih, Anda dapat menyalurkannya melalui:",
    thanks: "Terima kasih atas doa restu Anda",
  },
  umum: {
    badge: "Wedding Celebration",
    coupleIntro: "Dengan penuh sukacita kami mengundang Anda",
    ceremonyLabel: "Upacara Pernikahan",
    receptionLabel: "Resepsi Pernikahan",
    giftIntro:
      "Kehadiran dan doa Anda adalah hadiah terindah bagi kami. Jika Anda ingin memberikan tanda kasih, Anda dapat menyalurkannya melalui:",
    thanks: "Terima kasih atas kehadiran dan doa Anda",
  },
};

export const getCopy = (tone?: string | null): InvitationCopy => COPY[tone === "umum" ? "umum" : "islami"];

export const DEFAULT_QUOTES: Record<InvitationTone, { text: string; source: string }> = {
  islami: {
    text: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum: 21",
  },
  umum: {
    text: "Dua hati yang dipertemukan, satu tujuan yang dijalani bersama. Terima kasih telah menjadi bagian dari perjalanan kami.",
    source: "",
  },
};
