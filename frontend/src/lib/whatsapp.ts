// Normalisasi nomor telepon Indonesia ke format internasional tanpa "+" untuk tautan wa.me.
export const toWaNumber = (phone?: string | null): string | null => {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return digits.length >= 9 && digits.length <= 15 ? digits : null;
};

export const buildWaLink = (phone: string | null | undefined, text: string): string | null => {
  const number = toWaNumber(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
};

export const buildInviteMessage = (guestName: string, link: string, couple: string): string =>
  `Kepada Yth. Bapak/Ibu/Saudara/i *${guestName}*,

Tanpa mengurangi rasa hormat, perkenankan kami ${couple} mengundang Anda untuk menghadiri acara pernikahan kami.

Detail undangan:
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu. Terima kasih.`;
