import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Check, ChevronDown, Copy, Download, Instagram, Mail, MapPin, Send } from "lucide-react";
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
import { CallaDivider, CallaLily, GoldDust, MonogramFrame, NoirCallaKeyframes } from "./NoirCallaOrnaments.js";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B11]";
const BTN_GOLD = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-sm font-semibold tracking-wide text-[#080B11] transition-colors hover:bg-[#C59F2D] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
const BTN_GHOST = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#D4AF37]/40 px-5 text-sm font-medium text-[#F5F0E6] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37] ${FOCUS}`;
const CARD = "rounded-2xl border border-[#D4AF37]/20 bg-[#0F1420]";
const FIELD = `min-h-[44px] w-full rounded-xl border border-[#D4AF37]/25 bg-[#0A0E17] px-4 text-base text-[#F5F0E6] placeholder:text-slate-400 ${FOCUS}`;
const MUTED = "text-slate-300";
const EYEBROW = "text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]";

const nick = (value: string | null | undefined, fallback: string): string => value?.trim() || fallback;

// Long single-word names must shrink instead of breaking mid-word on a phone.
const nameSize = (...names: string[]): string => {
  const longest = longestWordLength(...names);
  if (longest > 13) return "text-3xl sm:text-5xl";
  if (longest > 10) return "text-4xl sm:text-5xl";
  return "text-5xl sm:text-6xl";
};

const SectionTitle: React.FC<{ eyebrow: string; title: string; id: string }> = ({ eyebrow, title, id }) => (
  <div className="mb-10 text-center">
    <p className={EYEBROW}>{eyebrow}</p>
    <h2 id={id} className="mt-3 font-playfair text-3xl font-normal leading-tight text-[#F5F0E6] sm:text-4xl">
      {title}
    </h2>
    <span aria-hidden="true" className="mx-auto mt-5 block h-px w-12 bg-[#D4AF37]/60" />
  </div>
);

/* ------------------------------------------------------------------- hero */

interface HeroProps {
  invitation: DigitalInvitation;
  guestName: string | null;
  badge: string;
  opened: boolean;
  onOpen: () => void;
}

// One full-height photo serves as both the closed cover and the opening of the invitation.
const Hero: React.FC<HeroProps> = ({ invitation, guestName, badge, opened, onOpen }) => {
  const groom = nick(invitation.groomNickName, "Mempelai Pria");
  const bride = nick(invitation.brideNickName, "Mempelai Wanita");
  const date = formatEventDate(invitation.akadDate ?? invitation.resepsiDate);

  return (
    <section
      aria-label="Sampul undangan"
      className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden"
    >
      {invitation.coverPhotoUrl ? (
        <img
          src={invitation.coverPhotoUrl}
          alt={`Foto ${groom} dan ${bride}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,#1A2233_0%,#0D1117_50%,#080B11_100%)]" />
      )}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#080B11]/80 to-transparent" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-[#080B11] via-[#080B11]/85 to-transparent"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-[#D4AF37]/30" />

      <div className="relative px-8 pt-12 text-center">
        <MonogramFrame className="h-16 w-16">
          <span className="font-playfair text-lg text-[#D4AF37]">
            {groom.charAt(0).toUpperCase()}&amp;{bride.charAt(0).toUpperCase()}
          </span>
        </MonogramFrame>
        <p className={`mt-4 ${EYEBROW}`}>{badge}</p>
        {!invitation.coverPhotoUrl && <CallaLily className="mx-auto mt-8 h-40 w-20" />}
      </div>

      <div className="relative px-8 pb-12 pt-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-200">
          {invitation.title?.trim() || "The Wedding of"}
        </p>
        <h1
          className={`mt-4 break-words font-playfair font-normal leading-[1.08] text-[#F5F0E6] ${nameSize(groom, bride)}`}
        >
          {groom}
          <span className="my-1 block text-3xl italic text-[#D4AF37]">&amp;</span>
          {bride}
        </h1>
        {date && <p className="mt-5 text-sm uppercase tracking-[0.2em] text-slate-200">{date}</p>}

        {/* Fixed height keeps the names in place when the cover controls swap for the scroll cue. */}
        <div className={`mt-8 ${guestName ? "min-h-[10rem]" : "min-h-[4.5rem]"}`}>
          {opened ? (
            <div className="nc-fade flex flex-col items-center gap-2 pt-4 text-slate-300">
              <span className="text-xs uppercase tracking-[0.3em]">Gulir ke bawah</span>
              <ChevronDown className="nc-float h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            </div>
          ) : (
            <>
              {guestName && (
                <div className="mx-auto max-w-xs border-y border-[#D4AF37]/30 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Kepada Yth.</p>
                  <p className="mt-2 break-words font-playfair text-2xl text-[#F5F0E6]">{guestName}</p>
                </div>
              )}
              <button type="button" onClick={onOpen} className={`${BTN_GOLD} mt-6 px-8`}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Buka Undangan
              </button>
            </>
          )}
        </div>
      </div>
    </section>
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
    <section aria-label="Hitung mundur" className="px-6 py-12 text-center">
      <Reveal>
        <p className={EYEBROW}>Menuju Hari Bahagia</p>
        {isOver ? (
          <p className="mt-6 font-playfair text-2xl text-[#F5F0E6]">Hari bahagia telah tiba.</p>
        ) : (
          <div className="mx-auto mt-8 grid max-w-sm grid-cols-4 divide-x divide-[#D4AF37]/25">
            {units.map(([label, value]) => (
              <div key={label} className="px-1">
                <span className="block font-playfair text-4xl tabular-nums lining-nums text-[#F5F0E6] sm:text-5xl">
                  {pad2(value)}
                </span>
                <span className={`mt-2 block text-xs uppercase tracking-[0.2em] ${MUTED}`}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
};

/* ------------------------------------------------------------------ quote */

const Quote: React.FC<{ text: string; source: string | null }> = ({ text, source }) => (
  <section aria-label="Kutipan" className="px-8 py-12 text-center">
    <Reveal>
      <CallaLily className="mx-auto h-20 w-10" />
      <blockquote className="mt-6 font-playfair text-lg italic leading-relaxed text-[#F5F0E6] sm:text-xl">
        {text}
      </blockquote>
      {source?.trim() && <p className={`mt-5 ${EYEBROW}`}>{source}</p>}
    </Reveal>
  </section>
);

/* ---------------------------------------------------------------- mempelai */

interface PersonProps {
  role: "Putra" | "Putri";
  fullName: string;
  photoUrl: string | null;
  father: string | null;
  mother: string | null;
  instagram: string | null;
}

const Person: React.FC<PersonProps> = ({ role, fullName, photoUrl, father, mother, instagram }) => {
  const parents = [father?.trim(), mother?.trim()].filter(Boolean).join(" & ");
  const igUrl = instagramHref(instagram);
  return (
    <Reveal className="flex flex-col items-center text-center">
      <div className="relative w-[65%] max-w-[16rem]">
        <span aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 border border-[#D4AF37]/50" />
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0F1420]">
          {photoUrl ? (
            <img src={photoUrl} alt={`Foto ${fullName}`} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_50%_30%,#1A2233,#0D1117)]">
              <CallaLily className="h-36 w-[4.5rem]" />
            </div>
          )}
        </div>
      </div>
      <h3 className="mt-10 max-w-full text-balance break-words font-playfair text-2xl font-normal leading-snug text-[#F5F0E6]">
        {fullName}
      </h3>
      {parents && (
        <p className={`mt-2 max-w-xs text-sm leading-relaxed ${MUTED}`}>
          {role} dari <span className="text-[#F5F0E6]">{parents}</span>
        </p>
      )}
      {igUrl && (
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm text-[#D4AF37] hover:text-[#F5F0E6] ${FOCUS}`}
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />@{instagram?.trim().replace(/^@/, "")}
        </a>
      )}
    </Reveal>
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
        <h3 className={EYEBROW}>{event.label}</h3>
        {date && (
          <>
            <p className="mt-4 font-playfair text-2xl leading-snug text-[#F5F0E6]">{date}</p>
            <p className={`mt-1 text-sm ${MUTED}`}>{formatTimeRange(event.start, event.end, invitation.timezone)}</p>
          </>
        )}
        {(event.venue || event.address) && (
          <div className="mt-5 border-t border-[#D4AF37]/15 pt-5">
            {event.venue && <p className="font-semibold text-[#F5F0E6]">{event.venue}</p>}
            {event.address && <p className={`mt-1 text-sm leading-relaxed ${MUTED}`}>{event.address}</p>}
          </div>
        )}
        {(map || calendarUrl) && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {map && (
              <a href={map} target="_blank" rel="noopener noreferrer" className={BTN_GOLD}>
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Buka Peta
              </a>
            )}
            {calendarUrl && (
              <>
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={BTN_GHOST}>
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  Simpan ke Kalender
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (downloadIcs(calendarEvent)) toast.success("Kalender .ics berhasil diunduh");
                  }}
                  className={BTN_GHOST}
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
  <section aria-labelledby="nc-story" className="px-6 py-12">
    <SectionTitle eyebrow="Perjalanan" title="Kisah Kami" id="nc-story" />
    <ol>
      {items.map((item, i) => (
        <li key={`${item.year}-${i}`} className="text-center">
          {i > 0 && <span aria-hidden="true" className="mx-auto my-8 block h-10 w-px bg-[#D4AF37]/40" />}
          <Reveal>
            <p className="font-playfair text-3xl italic lining-nums text-[#D4AF37]">{item.year}</p>
            <h3 className="mt-2 font-playfair text-xl font-normal text-[#F5F0E6]">{item.title}</h3>
            <p className={`mx-auto mt-2 max-w-sm text-sm leading-relaxed ${MUTED}`}>{item.story}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  </section>
);

/* ----------------------------------------------------------------- gallery */

const LIGHTBOX_TONE: LightboxTone = {
  control: `bg-[#0F1420] text-[#F5F0E6] hover:text-[#D4AF37] ${FOCUS}`,
  caption: "text-slate-200",
  backdrop: "backdrop:bg-[#080B11]/95",
};

const Gallery: React.FC<{ items: GalleryPhotoItem[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <section aria-labelledby="nc-gallery" className="px-6 py-12">
      <SectionTitle eyebrow="Momen" title="Galeri" id="nc-gallery" />
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <button
            key={`${item.url}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Buka foto ${i + 1}${item.caption ? `: ${item.caption}` : ""}`}
            className={`overflow-hidden bg-[#0F1420] ${FOCUS} ${
              i % 5 === 0 ? "col-span-2 aspect-[4/3]" : "aspect-[3/4]"
            }`}
          >
            <img
              src={item.url}
              alt={item.caption || `Foto galeri ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105 motion-reduce:transition-none"
            />
          </button>
        ))}
      </div>
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

  const copy = async (number: string, key: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(key);
      toast.success("Nomor rekening tersalin", { description: number });
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2500);
    } catch {
      toast.error("Tidak dapat menyalin. Salin nomor secara manual.");
    }
  };

  return (
    <section aria-labelledby="nc-gift" className="px-6 py-12">
      <SectionTitle eyebrow="Hadiah" title="Tanda Kasih" id="nc-gift" />
      <p className={`mx-auto -mt-4 mb-8 max-w-sm text-center text-sm leading-relaxed ${MUTED}`}>{intro}</p>
      <div className="space-y-4">
        {accounts.map((acc, i) => {
          const key = `${acc.bankName}-${acc.accountNumber}-${i}`;
          return (
            <Reveal key={key}>
              <div className={`p-6 text-center ${CARD}`}>
                <p className={EYEBROW}>{acc.bankName}</p>
                <p className="mt-3 break-all font-playfair text-2xl tabular-nums lining-nums tracking-wider text-[#F5F0E6]">
                  {acc.accountNumber}
                </p>
                <p className={`mt-1 text-sm ${MUTED}`}>a.n. {acc.accountHolder}</p>
                {acc.qrCodeUrl && (
                  <img
                    src={acc.qrCodeUrl}
                    alt={`Kode QR ${acc.bankName}`}
                    loading="lazy"
                    className="mx-auto mt-4 h-28 w-28 rounded-lg bg-white p-1"
                  />
                )}
                <button type="button" onClick={() => void copy(acc.accountNumber, key)} className={`${BTN_GHOST} mt-5`}>
                  {copied === key ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === key ? "Tersalin" : "Salin Nomor Rekening"}
                </button>
              </div>
            </Reveal>
          );
        })}
        {address && (
          <Reveal>
            <div className={`p-6 text-center ${CARD}`}>
              <p className={EYEBROW}>Alamat Kirim Kado</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#F5F0E6]">{address}</p>
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
  { value: "tidak_hadir", label: "Berhalangan" },
  { value: "ragu", label: "Ragu-ragu" },
];

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  hadir: "text-emerald-300",
  tidak_hadir: "text-rose-300",
  ragu: "text-amber-300",
};

const formatWishDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
};

const Rsvp: React.FC<Pick<InvitationThemeProps, "data" | "guest" | "rsvp">> = ({ data, guest, rsvp }) => {
  const form = useRsvpForm({ initialName: guest?.name, onSubmit: rsvp.submit });
  const labelCls = "mb-2 block text-sm font-medium text-[#F5F0E6]";

  return (
    <section aria-labelledby="nc-rsvp" className="px-6 py-12">
      <SectionTitle eyebrow="RSVP" title="Buku Tamu & Doa Restu" id="nc-rsvp" />
      <form onSubmit={(e) => void form.handleRsvpSubmit(e)} className={`space-y-5 p-6 ${CARD}`}>
        <div>
          <label htmlFor="nc-rsvp-name" className={labelCls}>
            Nama Anda
          </label>
          <input
            id="nc-rsvp-name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={form.rsvpName}
            onChange={(e) => form.setRsvpName(e.target.value)}
            placeholder="Nama lengkap Anda"
            className={FIELD}
          />
        </div>

        <div role="group" aria-labelledby="nc-rsvp-att">
          <span id="nc-rsvp-att" className={labelCls}>
            Konfirmasi Kehadiran
          </span>
          <div className="grid grid-cols-3 gap-2">
            {ATTENDANCE.map((opt) => {
              const active = form.attendance === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => form.setAttendance(opt.value)}
                  className={`min-h-[44px] rounded-xl border px-1 text-sm font-medium transition-colors ${FOCUS} ${
                    active
                      ? "border-[#D4AF37] bg-[#D4AF37] text-[#080B11]"
                      : "border-[#D4AF37]/25 bg-[#0A0E17] text-[#F5F0E6] hover:border-[#D4AF37]/70"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {form.attendance === "hadir" && (
          <div>
            <label htmlFor="nc-rsvp-count" className={labelCls}>
              Jumlah Tamu
            </label>
            <select
              id="nc-rsvp-count"
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
          <label htmlFor="nc-rsvp-msg" className={labelCls}>
            Ucapan &amp; Doa Restu
          </label>
          <textarea
            id="nc-rsvp-msg"
            rows={4}
            maxLength={500}
            value={form.message}
            onChange={(e) => form.setMessage(e.target.value)}
            placeholder="Tulis doa dan ucapan untuk kedua mempelai"
            className={`${FIELD} resize-none py-3`}
          />
        </div>

        <button type="submit" disabled={rsvp.isPending} className={`${BTN_GOLD} w-full`}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {rsvp.isPending ? "Mengirim..." : "Kirim Konfirmasi & Ucapan"}
        </button>
      </form>

      <h3 className="mt-12 text-center font-playfair text-2xl font-normal text-[#F5F0E6]">
        Doa Restu dari Para Tamu ({data.rsvpTotal})
      </h3>
      {data.rsvps.length === 0 ? (
        <p className={`mt-4 text-center text-sm ${MUTED}`}>Jadilah yang pertama memberikan doa restu.</p>
      ) : (
        <ul className="mt-4 max-h-[28rem] divide-y divide-[#D4AF37]/15 overflow-y-auto pr-1">
          {data.rsvps.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="break-words font-semibold text-[#F5F0E6]">{r.guestName}</p>
                <span className={`text-xs font-medium ${STATUS_STYLE[r.attendanceStatus]}`}>
                  {r.attendanceStatus === "hadir"
                    ? `Hadir (${r.guestCount} orang)`
                    : r.attendanceStatus === "tidak_hadir"
                    ? "Berhalangan"
                    : "Ragu-ragu"}
                </span>
              </div>
              {r.message?.trim() && (
                <p className="mt-2 whitespace-pre-line break-words font-playfair text-base italic leading-relaxed text-slate-200">
                  {r.message}
                </p>
              )}
              {formatWishDate(r.createdAt) && <p className="mt-2 text-xs text-slate-400">{formatWishDate(r.createdAt)}</p>}
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
    className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/60 bg-[#0F1420] text-[#D4AF37] shadow-lg shadow-black/40 hover:bg-[#1A2233] ${FOCUS}`}
  >
    <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-current ${isPlaying ? "nc-eq h-full" : "h-1.5"}`}
          style={isPlaying ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </span>
  </button>
);

/* -------------------------------------------------------------------- root */

export const NoirCallaTheme: React.FC<InvitationThemeProps> = ({ data, guest, music, copy, rsvp }) => {
  const { invitation } = data;
  const [opened, setOpened] = useState(false);
  const groom = nick(invitation.groomNickName, "Mempelai Pria");
  const bride = nick(invitation.brideNickName, "Mempelai Wanita");
  const couple = `${groom} & ${bride}`;

  useEffect(() => {
    if (opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  const handleOpen = () => {
    setOpened(true);
    music.start();
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
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#080B11] font-sans text-[#F5F0E6] antialiased selection:bg-[#D4AF37]/30">
      <NoirCallaKeyframes />
      <GoldDust className="fixed inset-0 z-0" />

      <div className="relative z-10 mx-auto max-w-xl">
        <Hero
          invitation={invitation}
          guestName={guest?.name?.trim() || null}
          badge={copy.badge}
          opened={opened}
          onOpen={handleOpen}
        />

        <main aria-hidden={!opened} style={{ visibility: opened ? "visible" : "hidden" }}>
          <Countdown invitation={invitation} />

          {invitation.openingQuote?.trim() && <Quote text={invitation.openingQuote} source={invitation.quoteSource} />}

          <section aria-labelledby="nc-couple" className="px-6 py-12">
            <SectionTitle eyebrow="Mempelai" title="Kedua Mempelai" id="nc-couple" />
            <p className={`mx-auto -mt-4 mb-12 max-w-sm text-center text-sm leading-relaxed ${MUTED}`}>
              {copy.coupleIntro}
            </p>
            <Person
              role="Putra"
              fullName={nick(invitation.groomFullName, groom)}
              photoUrl={invitation.groomPhotoUrl}
              father={invitation.groomFather}
              mother={invitation.groomMother}
              instagram={invitation.groomInstagram}
            />
            <p aria-hidden="true" className="my-10 text-center font-playfair text-4xl italic text-[#D4AF37]">
              &amp;
            </p>
            <Person
              role="Putri"
              fullName={nick(invitation.brideFullName, bride)}
              photoUrl={invitation.bridePhotoUrl}
              father={invitation.brideFather}
              mother={invitation.brideMother}
              instagram={invitation.brideInstagram}
            />
          </section>

          <CallaDivider className="py-4" />

          {events.length > 0 && (
            <section aria-labelledby="nc-events" className="px-6 py-12">
              <SectionTitle eyebrow="Waktu & Tempat" title="Rangkaian Acara" id="nc-events" />
              <div className="space-y-5">
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

          <footer className="px-6 pb-28 pt-12 text-center">
            <div className="flex items-end justify-center" aria-hidden="true">
              <CallaLily className="h-24 w-12 -rotate-12" />
              <CallaLily className="h-24 w-12 -scale-x-100 rotate-12" />
            </div>
            <p className="mt-8 text-sm text-slate-200">{copy.thanks}</p>
            <p className="mt-3 break-words font-playfair text-4xl leading-tight text-[#F5F0E6]">
              {groom} <span className="italic text-[#D4AF37]">&amp;</span> {bride}
            </p>
            <p className="mt-10 text-xs text-slate-400">Powered by WeddingPlan</p>
          </footer>
        </main>
      </div>

      {opened && music.hasMusic && <MusicButton isPlaying={music.isPlaying} onToggle={music.toggle} />}
    </div>
  );
};
