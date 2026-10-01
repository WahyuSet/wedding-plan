import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Check, Copy, Download, Instagram, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import type { DigitalInvitation, GalleryPhotoItem } from "../../../types/index.js";
import { instagramHref, safeHref } from "../../../lib/safeUrl.js";
import { downloadIcs, googleCalendarUrl } from "../shared/calendar.js";
import type { CalendarEvent } from "../shared/calendar.js";
import { formatEventDate, formatTimeRange, getEventStart } from "../shared/eventDate.js";
import { Lightbox } from "../shared/Lightbox.js";
import type { LightboxTone } from "../shared/Lightbox.js";
import { longestWordLength } from "../shared/names.js";
import { Reveal } from "../shared/Reveal.js";
import { useCountdown } from "../shared/useCountdown.js";
import { useRsvpForm } from "../shared/useRsvpForm.js";
import type { AttendanceStatus } from "../shared/useRsvpForm.js";
import type { InvitationThemeProps } from "../shared/types.js";
import { BoardSurface, ChalkKeyframes, ChalkStroke } from "./ChalkOrnaments.js";

// Palette: board #16241E, paper #FAF8F5, sage #4E6B50, one accent (burgundy #8B2E3F) for names and the main action.
const FOCUS_PAPER =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2E3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]";
const FOCUS_BOARD =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A882] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16241E]";
const BTN_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const BTN_PRIMARY = `${BTN_BASE} bg-[#8B2E3F] px-6 font-semibold text-white hover:bg-[#722332] ${FOCUS_PAPER}`;
const BTN_DARK = `${BTN_BASE} bg-[#16241E] px-5 font-semibold text-[#F4EFE6] hover:bg-[#22352C] ${FOCUS_PAPER}`;
const BTN_QUIET = `${BTN_BASE} border border-[#8A7F74] bg-white px-4 font-medium text-[#2B2420] hover:bg-[#F1ECE4] ${FOCUS_PAPER}`;
const BTN_BOARD = `${BTN_BASE} bg-[#F4EFE6] px-7 font-semibold text-[#16241E] hover:bg-white ${FOCUS_BOARD}`;
const CARD = "rounded-lg border border-[#D9D2C7] bg-white";
const FIELD = `min-h-[44px] w-full rounded-lg border border-[#8A7F74] bg-white px-4 text-base text-[#2B2420] placeholder:text-[#6B5F57] ${FOCUS_PAPER}`;
const MUTED = "text-[#5C4D44]";
const SCRIPT = "font-great-vibes font-normal tracking-normal";
const PHOTO_SHADOW = "shadow-[0_10px_30px_-14px_rgba(43,36,32,0.5)]";

const LIGHTBOX_TONE: LightboxTone = {
  control: `bg-[#F4EFE6] text-[#16241E] hover:bg-white ${FOCUS_BOARD}`,
  caption: "text-[#F4EFE6]",
};

const nick = (value: string | null | undefined, fallback: string): string => value?.trim() || fallback;

// Long single-word names must shrink instead of breaking mid-word on a phone.
const scriptSize = (...names: string[]): string => {
  const longest = longestWordLength(...names);
  if (longest > 13) return "text-4xl";
  if (longest > 10) return "text-5xl";
  return "text-6xl";
};

const SectionTitle: React.FC<{ title: string; id: string; lead?: string }> = ({ title, id, lead }) => (
  <div className="mb-8 text-center">
    <h2 id={id} className={`${SCRIPT} text-[2.5rem] leading-tight text-[#2B2420]`}>
      {title}
    </h2>
    <ChalkStroke className="mx-auto mt-1 text-[#4E6B50]" />
    {lead && <p className={`mx-auto mt-4 max-w-sm text-pretty text-sm leading-relaxed ${MUTED}`}>{lead}</p>}
  </div>
);

/* ------------------------------------------------------------------ cover */

interface CoverProps {
  bride: string;
  groom: string;
  date: string;
  guestName: string | null;
  onOpen: () => void;
}

const Cover: React.FC<CoverProps> = ({ bride, groom, date, guestName, onOpen }) => (
  <section
    aria-label="Sampul undangan"
    className="relative flex min-h-[100dvh] flex-col items-center justify-center px-10 py-16 text-center text-[#F4EFE6]"
  >
    <BoardSurface frame sprigs />
    <div className="relative w-full">
      <p className="font-playfair text-sm italic text-[#C4D0C5]">Undangan Pernikahan</p>
      <h1 className={`mt-4 break-words leading-[1.15] ${SCRIPT} ${scriptSize(bride, groom)}`}>
        {bride}
        <span className="block font-playfair text-xl italic text-[#C4D0C5]">&amp;</span>
        {groom}
      </h1>
      {date && <p className="mt-5 font-playfair text-base">{date}</p>}

      {guestName && (
        <div className="mx-auto mt-8 max-w-[16rem]">
          <ChalkStroke className="mx-auto text-[#C4D0C5]" />
          <p className="mt-4 text-sm text-[#C4D0C5]">Kepada Yth.</p>
          <p className="mt-1 break-words font-playfair text-xl">{guestName}</p>
        </div>
      )}

      <button type="button" onClick={onOpen} className={`${BTN_BOARD} mt-8`}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        Buka Undangan
      </button>
    </div>
  </section>
);

/* ------------------------------------------------------------------- hero */

const Hero: React.FC<{
  invitation: DigitalInvitation;
  photo: string | null;
  bride: string;
  groom: string;
  date: string;
}> = ({ invitation, photo, bride, groom, date }) => (
  <section aria-label="Pembuka" className="px-6 pb-10 pt-12 text-center">
    <p className={`font-playfair text-sm italic ${MUTED}`}>{invitation.title?.trim() || "The Wedding of"}</p>
    <h1 className={`mt-2 break-words leading-[1.15] text-[#8B2E3F] ${SCRIPT} ${scriptSize(bride, groom)}`}>
      {bride} &amp;&nbsp;{groom}
    </h1>
    {date && <p className="mt-3 font-playfair text-base text-[#2B2420]">{date}</p>}

    {photo ? (
      <figure className={`mx-auto mt-9 w-[86%] -rotate-1 bg-white p-2 pb-3 ${PHOTO_SHADOW}`}>
        <div className="aspect-[4/5] overflow-hidden bg-[#EFE9DF]">
          <img src={photo} alt={`Foto ${bride} dan ${groom}`} className="h-full w-full object-cover" />
        </div>
      </figure>
    ) : (
      <ChalkStroke className="mx-auto mt-6 text-[#4E6B50]" />
    )}
  </section>
);

/* ------------------------------------------------------------------ quote */

const Quote: React.FC<{ text: string; source: string | null }> = ({ text, source }) => (
  <section aria-label="Kutipan" className="px-8 py-10 text-center">
    <Reveal>
      <ChalkStroke className="mx-auto text-[#4E6B50]" />
      <blockquote className="mt-6 text-pretty font-playfair text-lg italic leading-relaxed text-[#2B2420]">{text}</blockquote>
      {source?.trim() && <p className="mt-4 text-sm font-semibold text-[#4E6B50]">{source}</p>}
    </Reveal>
  </section>
);

/* ---------------------------------------------------------------- mempelai */

interface PersonProps {
  role: "Putra" | "Putri";
  nickName: string;
  fullName: string | null;
  photoUrl: string | null;
  father: string | null;
  mother: string | null;
  instagram: string | null;
  tilt: string;
}

const Person: React.FC<PersonProps> = ({ role, nickName, fullName, photoUrl, father, mother, instagram, tilt }) => {
  const parents = [father?.trim(), mother?.trim()].filter(Boolean).join(" & ");
  const igUrl = instagramHref(instagram);
  const displayName = fullName?.trim() || nickName;
  return (
    <Reveal className="flex flex-col items-center text-center">
      <figure className={`w-[62%] max-w-[15rem] bg-white p-2 pb-3 ${tilt} ${PHOTO_SHADOW}`}>
        <div className="aspect-[3/4] overflow-hidden bg-[#EFE9DF]">
          {photoUrl ? (
            <img src={photoUrl} alt={`Foto ${displayName}`} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            // Initial stands in for a missing portrait; never a stock photo of a stranger.
            <div className={`flex h-full items-center justify-center text-7xl text-[#4E6B50] ${SCRIPT}`} aria-hidden="true">
              {nickName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </figure>
      <p className={`mt-6 break-words text-4xl leading-tight text-[#8B2E3F] ${SCRIPT}`}>{nickName}</p>
      {displayName !== nickName && (
        <h3 className="mt-1 max-w-full text-balance break-words font-playfair text-lg font-semibold tracking-normal text-[#2B2420]">
          {displayName}
        </h3>
      )}
      {parents && (
        <p className={`mt-2 max-w-xs text-sm leading-relaxed ${MUTED}`}>
          {role} dari <span className="text-[#2B2420]">{parents}</span>
        </p>
      )}
      {igUrl && (
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#4E6B50] hover:text-[#2B2420] ${FOCUS_PAPER}`}
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />@{instagram?.trim().replace(/^@/, "")}
        </a>
      )}
    </Reveal>
  );
};

/* --------------------------------------------------------------- countdown */

const pad2 = (n: number): string => String(n).padStart(2, "0");

const Countdown: React.FC<{ invitation: DigitalInvitation }> = ({ invitation }) => {
  const target = getEventStart(invitation);
  const { days, hours, minutes, seconds, isOver } = useCountdown(target);
  if (!target) return null;
  const units: Array<[string, number]> = [
    ["Hari", days],
    ["Jam", hours],
    ["Menit", minutes],
    ["Detik", seconds],
  ];
  return (
    <section aria-labelledby="cv-countdown" className="relative px-6 py-12 text-center text-[#F4EFE6]">
      <BoardSurface />
      <div className="relative">
        <h2 id="cv-countdown" className={`${SCRIPT} text-4xl leading-tight`}>
          Menuju Hari Bahagia
        </h2>
        <ChalkStroke className="mx-auto mt-1 text-[#C4D0C5]" />
        {isOver ? (
          <p className="mt-6 font-playfair text-xl">Hari bahagia telah tiba.</p>
        ) : (
          <div className="mx-auto mt-7 grid max-w-xs grid-cols-4 gap-2">
            {units.map(([label, value]) => (
              <div key={label}>
                <span className="block font-playfair text-4xl tabular-nums lining-nums">{pad2(value)}</span>
                <span className="mt-1 block text-xs text-[#C4D0C5]">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ events */

interface EventInfo {
  label: string;
  date: string | null;
  start: string | null;
  end: string | null;
  venue: string | null;
  address: string | null;
  mapUrl: string | null;
}

const EventCard: React.FC<{ event: EventInfo; invitation: DigitalInvitation; couple: string }> = ({
  event,
  invitation,
  couple,
}) => {
  const calendarEvent: CalendarEvent = {
    title: `${event.label}: ${couple}`,
    date: event.date,
    startTime: event.start,
    endTime: event.end,
    timezone: invitation.timezone,
    location: [event.venue, event.address].filter(Boolean).join(", "),
    description: `Undangan pernikahan ${couple}`,
  };
  const calendarUrl = googleCalendarUrl(calendarEvent);
  const map = safeHref(event.mapUrl);
  const date = formatEventDate(event.date);

  return (
    <Reveal>
      <article className={`p-6 text-center ${CARD}`}>
        <h3 className="text-sm font-semibold tracking-normal text-[#4E6B50]">{event.label}</h3>
        {date && (
          <>
            <p className="mt-3 font-playfair text-xl font-semibold leading-snug text-[#2B2420]">{date}</p>
            <p className={`mt-1 text-sm ${MUTED}`}>{formatTimeRange(event.start, event.end, invitation.timezone)}</p>
          </>
        )}
        {(event.venue || event.address) && (
          <div className="mt-4 border-t border-[#D9D2C7] pt-4">
            {event.venue && <p className="font-semibold text-[#2B2420]">{event.venue}</p>}
            {event.address && <p className={`mt-1 text-sm leading-relaxed ${MUTED}`}>{event.address}</p>}
          </div>
        )}
        {(map || calendarUrl) && (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {map && (
              <a href={map} target="_blank" rel="noopener noreferrer" className={BTN_DARK}>
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Buka Peta
              </a>
            )}
            {calendarUrl && (
              <>
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={BTN_QUIET}>
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  Simpan ke Kalender
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (downloadIcs(calendarEvent)) toast.success("Kalender .ics berhasil diunduh");
                  }}
                  className={BTN_QUIET}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Unduh .ics
                </button>
              </>
            )}
          </div>
        )}
      </article>
    </Reveal>
  );
};

/* -------------------------------------------------------------- love story */

const LoveStory: React.FC<{ items: Array<{ year: string; title: string; story: string }> }> = ({ items }) => (
  <section aria-labelledby="cv-story" className="px-6 py-12">
    <SectionTitle title="Kisah Kami" id="cv-story" />
    <ol className="mx-auto max-w-sm space-y-8 border-l border-[#D9D2C7] pl-6">
      {items.map((item, i) => (
        <li key={`${item.year}-${i}`} className="relative">
          <span aria-hidden="true" className="absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full bg-[#4E6B50]" />
          <Reveal>
            <p className="font-playfair text-xl font-semibold lining-nums text-[#4E6B50]">{item.year}</p>
            <h3 className="mt-1 font-playfair text-lg font-semibold tracking-normal text-[#2B2420]">{item.title}</h3>
            <p className={`mt-1 text-pretty text-sm leading-relaxed ${MUTED}`}>{item.story}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  </section>
);

/* ----------------------------------------------------------------- gallery */

const GALLERY_PREVIEW = 6;

const Gallery: React.FC<{ items: GalleryPhotoItem[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const close = useCallback(() => setOpen(null), []);
  const visible = showAll ? items : items.slice(0, GALLERY_PREVIEW);

  return (
    <section aria-labelledby="cv-gallery" className="px-6 py-12">
      <SectionTitle title="Galeri" id="cv-gallery" />
      <div className="grid grid-cols-2 gap-3">
        {visible.map((item, i) => (
          <button
            key={`${item.url}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Buka foto ${i + 1}${item.caption ? `: ${item.caption}` : ""}`}
            className={`bg-white p-1.5 ${PHOTO_SHADOW} ${FOCUS_PAPER}`}
          >
            <span className="block aspect-[4/5] overflow-hidden bg-[#EFE9DF]">
              <img
                src={item.url}
                alt={item.caption || `Foto galeri ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </span>
          </button>
        ))}
      </div>
      {!showAll && items.length > GALLERY_PREVIEW && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setShowAll(true)} className={BTN_QUIET}>
            Lihat semua foto ({items.length})
          </button>
        </div>
      )}
      {open !== null && <Lightbox items={items} index={open} tone={LIGHTBOX_TONE} onClose={close} onChange={setOpen} />}
    </section>
  );
};

/* -------------------------------------------------------------------- gift */

interface GiftProps {
  intro: string;
  accounts: InvitationThemeProps["data"]["bankAccounts"];
  address: string | null;
}

const Gift: React.FC<GiftProps> = ({ intro, accounts, address }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success(done, { description: text });
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2500);
    } catch {
      toast.error("Tidak dapat menyalin. Salin secara manual.");
    }
  };

  return (
    <section aria-labelledby="cv-gift" className="px-6 py-12">
      <SectionTitle title="Tanda Kasih" id="cv-gift" lead={intro} />
      <div className="space-y-4">
        {accounts.map((acc, i) => {
          const key = `${acc.bankName}-${acc.accountNumber}-${i}`;
          return (
            <Reveal key={key}>
              <div className={`p-6 text-center ${CARD}`}>
                <p className="text-sm font-semibold text-[#4E6B50]">{acc.bankName}</p>
                <p className="mt-2 break-all font-playfair text-2xl font-semibold tabular-nums lining-nums text-[#2B2420]">
                  {acc.accountNumber}
                </p>
                <p className={`mt-1 text-sm ${MUTED}`}>a.n. {acc.accountHolder}</p>
                {acc.qrCodeUrl && (
                  <img
                    src={acc.qrCodeUrl}
                    alt={`Kode QR ${acc.bankName}`}
                    loading="lazy"
                    className="mx-auto mt-4 h-28 w-28 border border-[#D9D2C7] bg-white p-1"
                  />
                )}
                <button
                  type="button"
                  onClick={() => void copy(acc.accountNumber, key, "Nomor rekening tersalin")}
                  className={`${BTN_QUIET} mt-4`}
                >
                  {copied === key ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied === key ? "Tersalin" : "Salin nomor rekening"}
                </button>
              </div>
            </Reveal>
          );
        })}
        {address && (
          <Reveal>
            <div className={`p-6 text-center ${CARD}`}>
              <p className="text-sm font-semibold text-[#4E6B50]">Alamat kirim kado</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#2B2420]">{address}</p>
              <button
                type="button"
                onClick={() => void copy(address, "address", "Alamat tersalin")}
                className={`${BTN_QUIET} mt-4`}
              >
                {copied === "address" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "address" ? "Tersalin" : "Salin alamat"}
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------- rsvp */

const ATTENDANCE: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "hadir", label: "Hadir" },
  { value: "tidak_hadir", label: "Tidak hadir" },
  { value: "ragu", label: "Masih ragu" },
];

const STATUS_TEXT: Record<AttendanceStatus, string> = {
  hadir: "text-emerald-800",
  tidak_hadir: "text-rose-800",
  ragu: "text-amber-800",
};

const formatWishDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
};

const Rsvp: React.FC<Pick<InvitationThemeProps, "data" | "guest" | "rsvp">> = ({ data, guest, rsvp }) => {
  const form = useRsvpForm({ initialName: guest?.name, onSubmit: rsvp.submit });
  const labelCls = "mb-2 block text-sm font-semibold text-[#2B2420]";
  const hintCls = `ml-1 font-normal ${MUTED}`;

  return (
    <section aria-labelledby="cv-rsvp" className="px-6 py-12">
      <SectionTitle title="Konfirmasi Kehadiran" id="cv-rsvp" />
      <form onSubmit={(e) => void form.handleRsvpSubmit(e)} className={`space-y-5 p-6 ${CARD}`}>
        <div>
          <label htmlFor="cv-rsvp-name" className={labelCls}>
            Nama<span className={hintCls}>(wajib)</span>
          </label>
          <input
            id="cv-rsvp-name"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            required
            maxLength={100}
            value={form.rsvpName}
            onChange={(e) => form.setRsvpName(e.target.value)}
            placeholder="Nama lengkap Anda"
            className={FIELD}
          />
        </div>

        <fieldset>
          <legend className={labelCls}>Kehadiran</legend>
          <div className="grid grid-cols-3 gap-2">
            {ATTENDANCE.map((opt) => (
              <label key={opt.value} className="block cursor-pointer">
                <input
                  type="radio"
                  name="cv-rsvp-attendance"
                  value={opt.value}
                  checked={form.attendance === opt.value}
                  onChange={() => form.setAttendance(opt.value)}
                  className="peer sr-only"
                />
                <span className="flex min-h-[44px] items-center justify-center rounded-lg border border-[#8A7F74] bg-white px-1 text-center text-sm font-medium text-[#2B2420] transition-colors peer-checked:border-[#16241E] peer-checked:bg-[#16241E] peer-checked:font-semibold peer-checked:text-[#F4EFE6] peer-focus-visible:ring-2 peer-focus-visible:ring-[#8B2E3F] peer-focus-visible:ring-offset-2">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {form.attendance === "hadir" && (
          <div>
            <label htmlFor="cv-rsvp-count" className={labelCls}>
              Jumlah tamu
            </label>
            <select
              id="cv-rsvp-count"
              value={form.guestCount}
              onChange={(e) => form.setGuestCount(Number(e.target.value))}
              className={FIELD}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} orang
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="cv-rsvp-msg" className={labelCls}>
            Ucapan dan doa<span className={hintCls}>(opsional)</span>
          </label>
          <textarea
            id="cv-rsvp-msg"
            rows={4}
            maxLength={500}
            value={form.message}
            onChange={(e) => form.setMessage(e.target.value)}
            placeholder="Tulis ucapan untuk kedua mempelai"
            className={`${FIELD} resize-none py-3`}
          />
        </div>

        <button type="submit" disabled={rsvp.isPending} className={`${BTN_PRIMARY} w-full`}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {rsvp.isPending ? "Mengirim..." : "Kirim konfirmasi"}
        </button>
      </form>

      <h3 className="mt-10 text-center font-playfair text-xl font-semibold tracking-normal text-[#2B2420]">
        Ucapan dari tamu ({data.rsvpTotal})
      </h3>
      {data.rsvps.length === 0 ? (
        <p className={`mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed ${MUTED}`}>
          Belum ada ucapan. Isi formulir di atas untuk menjadi yang pertama.
        </p>
      ) : (
        <ul className="mt-3 max-h-[28rem] divide-y divide-[#D9D2C7] overflow-y-auto pr-1">
          {data.rsvps.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="break-words font-semibold text-[#2B2420]">{r.guestName}</p>
                <span className={`text-xs font-semibold ${STATUS_TEXT[r.attendanceStatus]}`}>
                  {r.attendanceStatus === "hadir"
                    ? `Hadir (${r.guestCount} orang)`
                    : r.attendanceStatus === "tidak_hadir"
                    ? "Tidak hadir"
                    : "Masih ragu"}
                </span>
              </div>
              {r.message?.trim() && (
                <p className={`mt-1 whitespace-pre-line break-words text-sm leading-relaxed ${MUTED}`}>{r.message}</p>
              )}
              {formatWishDate(r.createdAt) && <p className={`mt-1 text-xs ${MUTED}`}>{formatWishDate(r.createdAt)}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

/* ------------------------------------------------------------------- music */

const MusicButton: React.FC<{ isPlaying: boolean; onToggle: () => void }> = ({ isPlaying, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={isPlaying ? "Jeda musik latar" : "Putar musik latar"}
    className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#C4A882] bg-[#16241E] text-[#F4EFE6] ${PHOTO_SHADOW} hover:bg-[#22352C] ${FOCUS_BOARD}`}
  >
    <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-current ${isPlaying ? "cv-eq h-full" : "h-1.5"}`}
          style={isPlaying ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </span>
  </button>
);

/* -------------------------------------------------------------------- root */

export const ChalkAndVowTheme: React.FC<InvitationThemeProps> = ({ data, guest, music, copy, rsvp }) => {
  const { invitation } = data;
  const [opened, setOpened] = useState(false);
  const bride = nick(invitation.brideNickName, "Mempelai Wanita");
  const groom = nick(invitation.groomNickName, "Mempelai Pria");
  const couple = `${bride} & ${groom}`;
  const date = formatEventDate(invitation.akadDate ?? invitation.resepsiDate);
  const quote = invitation.openingQuote?.trim() || null;

  const heroPhoto = invitation.heroPhotoUrl || invitation.coverPhotoUrl || null;

  // Warm the opening photo while the cover is still showing.
  useEffect(() => {
    if (!heroPhoto) return;
    const img = new Image();
    img.src = heroPhoto;
  }, [heroPhoto]);

  const handleOpen = () => {
    setOpened(true);
    music.start();
    window.scrollTo(0, 0);
  };

  const events: EventInfo[] = [
    {
      label: copy.ceremonyLabel,
      date: invitation.akadDate,
      start: invitation.akadStartTime,
      end: invitation.akadEndTime,
      venue: invitation.akadVenueName,
      address: invitation.akadAddress,
      mapUrl: invitation.akadMapUrl,
    },
    {
      label: copy.receptionLabel,
      date: invitation.resepsiDate,
      start: invitation.resepsiStartTime,
      end: invitation.resepsiEndTime,
      venue: invitation.resepsiVenueName,
      address: invitation.resepsiAddress,
      mapUrl: invitation.resepsiMapUrl,
    },
  ].filter((e) => e.date || e.venue);

  const hasGift = data.bankAccounts.length > 0 || Boolean(invitation.giftAddress?.trim());

  return (
    <div className="min-h-[100dvh] bg-[#16241E] font-sans text-[#2B2420] antialiased selection:bg-[#8B2E3F]/20">
      <ChalkKeyframes />

      {/* Desktop only: the board stays beside the scrolling invitation. It repeats content, so it is hidden from assistive tech. */}
      <aside
        aria-hidden="true"
        className="fixed inset-y-0 left-0 hidden items-center justify-center px-16 text-center text-[#F4EFE6] md:right-[460px] md:flex lg:right-[480px]"
      >
        <BoardSurface frame sprigs />
        {/* Between md and lg the panel is too narrow for text, so it stays a plain board. */}
        <div className="relative hidden max-w-md lg:block">
          {opened ? (
            <div className="cv-fade">
              <p className={`leading-[1.15] ${SCRIPT} text-6xl lg:text-7xl`}>
                {bride}
                <span className="block font-playfair text-2xl italic text-[#C4D0C5]">&amp;</span>
                {groom}
              </p>
              {date && <p className="mt-6 font-playfair text-lg">{date}</p>}
            </div>
          ) : (
            quote && (
              <>
                <p className="text-pretty font-playfair text-lg italic leading-relaxed">{quote}</p>
                {invitation.quoteSource?.trim() && (
                  <p className="mt-4 text-sm font-semibold text-[#C4D0C5]">{invitation.quoteSource}</p>
                )}
              </>
            )
          )}
        </div>
      </aside>

      <div className="relative ml-auto min-h-[100dvh] w-full overflow-x-hidden bg-[#FAF8F5] md:w-[460px] lg:w-[480px]">
        {!opened ? (
          <Cover bride={bride} groom={groom} date={date} guestName={guest?.name?.trim() || null} onOpen={handleOpen} />
        ) : (
          <main className="cv-fade">
            <Hero invitation={invitation} photo={heroPhoto} bride={bride} groom={groom} date={date} />

            {quote && <Quote text={quote} source={invitation.quoteSource} />}

            <section aria-labelledby="cv-couple" className="px-6 py-12">
              <SectionTitle title="Mempelai" id="cv-couple" lead={copy.coupleIntro} />
              <Person
                role="Putri"
                nickName={bride}
                fullName={invitation.brideFullName}
                photoUrl={invitation.bridePhotoUrl}
                father={invitation.brideFather}
                mother={invitation.brideMother}
                instagram={invitation.brideInstagram}
                tilt="-rotate-1"
              />
              <p aria-hidden="true" className={`my-8 text-center text-5xl text-[#4E6B50] ${SCRIPT}`}>
                &amp;
              </p>
              <Person
                role="Putra"
                nickName={groom}
                fullName={invitation.groomFullName}
                photoUrl={invitation.groomPhotoUrl}
                father={invitation.groomFather}
                mother={invitation.groomMother}
                instagram={invitation.groomInstagram}
                tilt="rotate-1"
              />
            </section>

            <Countdown invitation={invitation} />

            {events.length > 0 && (
              <section aria-labelledby="cv-events" className="px-6 py-12">
                <SectionTitle title="Rangkaian Acara" id="cv-events" />
                <div className="space-y-4">
                  {events.map((event) => (
                    <EventCard key={event.label} event={event} invitation={invitation} couple={couple} />
                  ))}
                </div>
              </section>
            )}

            {data.loveStories.length > 0 && <LoveStory items={data.loveStories} />}

            {data.gallery.length > 0 && <Gallery items={data.gallery} />}

            {hasGift && (
              <Gift intro={copy.giftIntro} accounts={data.bankAccounts} address={invitation.giftAddress?.trim() || null} />
            )}

            <Rsvp data={data} guest={guest} rsvp={rsvp} />

            <footer className="relative px-6 pb-20 pt-14 text-center text-[#F4EFE6]">
              <BoardSurface />
              <div className="relative">
                <p className="text-sm text-[#C4D0C5]">{copy.thanks}</p>
                <p className={`mt-3 text-balance break-words text-5xl leading-tight ${SCRIPT}`}>
                  {bride} &amp; {groom}
                </p>
                <ChalkStroke className="mx-auto mt-2 text-[#C4D0C5]" />
                <p className="mt-8 text-xs text-[#C4D0C5]">Powered by WeddingPlan</p>
              </div>
            </footer>
          </main>
        )}
      </div>

      {opened && music.hasMusic && <MusicButton isPlaying={music.isPlaying} onToggle={music.toggle} />}
    </div>
  );
};
