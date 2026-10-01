import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  CornerLeaves,
  EucalyptusSprig,
  FernAccent,
  Fireflies,
  LeafSprigDivider,
  MonogramFrame,
  NocturneKeyframes,
} from "./NocturneOrnaments.js";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04120D]";
const BTN_GOLD = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#EAB308] px-6 text-sm font-semibold tracking-wide text-[#04120D] transition-colors hover:bg-[#CA8A04] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
const BTN_GHOST = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-emerald-500/40 px-5 text-sm font-medium text-emerald-50 transition-colors hover:border-[#EAB308] hover:text-[#EAB308] ${FOCUS}`;
const CARD = "rounded-3xl border border-emerald-700/40 bg-[#0A2218]/90";
const FIELD = `min-h-[44px] w-full rounded-xl border border-emerald-500/60 bg-[#061B13] px-4 text-emerald-50 placeholder:text-emerald-200/65 ${FOCUS}`;
const MUTED = "text-emerald-200/70";

const LIGHTBOX_TONE: LightboxTone = {
  control: `bg-[#0A2218] text-emerald-50 hover:text-[#EAB308] ${FOCUS}`,
  caption: "text-emerald-100",
  backdrop: "backdrop:bg-[#04120D]/95",
};

const nick = (value: string | null | undefined, fallback: string): string => value?.trim() || fallback;

// Long single-word names must shrink instead of running off a phone screen.
const scriptSize = (...names: string[]): string => {
  const longest = longestWordLength(...names);
  if (longest > 13) return "text-4xl sm:text-6xl";
  if (longest > 10) return "text-5xl sm:text-6xl";
  return "text-6xl sm:text-7xl";
};

const SectionTitle: React.FC<{ title: string; id: string }> = ({ title, id }) => (
  <div className="mb-8">
    <span aria-hidden="true" className="block h-px w-8 bg-[#EAB308]/60" />
    <h2 id={id} className="mt-4 font-playfair text-3xl leading-tight text-emerald-50 sm:text-4xl">
      {title}
    </h2>
  </div>
);

const Icon: React.FC<{ d: string }> = ({ d }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);

const ICON_PIN = "M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z";
const ICON_CAL = "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z";
const ICON_DL = "M12 4v11m0 0l-4-4m4 4l4-4M5 20h14";
const ICON_COPY = "M9 9h10v11H9zM5 15V4h10";
const ICON_IG = "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 16a4 4 0 100-8 4 4 0 000 8zM17.5 6.5h.01";

/* ------------------------------------------------------------------ cover */

interface CoverProps {
  invitation: DigitalInvitation;
  guestName: string | null;
  onOpen: () => void;
}

const Cover: React.FC<CoverProps> = ({ invitation, guestName, onOpen }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const groom = nick(invitation.groomNickName, "Mempelai Pria");
  const bride = nick(invitation.brideNickName, "Mempelai Wanita");
  const date = formatEventDate(invitation.akadDate ?? invitation.resepsiDate);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sampul undangan"
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#04120D]"
    >
      {invitation.coverPhotoUrl ? (
        <img src={invitation.coverPhotoUrl} alt={`Foto sampul ${groom} dan ${bride}`} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#0F3A28_0%,#061B13_45%,#04120D_100%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#04120D] via-[#04120D]/75 to-[#04120D]/35" />
      <Fireflies count={6} className="absolute inset-x-0 top-0 h-[45%]" />
      <CornerLeaves position="tl" />
      <CornerLeaves position="tr" />

      <div className="relative mx-auto flex min-h-full max-w-xl flex-col justify-end px-6 pb-10 pt-40">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EAB308]">The Wedding of</p>
        <div className={`mt-3 font-great-vibes leading-[0.95] text-emerald-50 ${scriptSize(groom, bride)}`}>
          {groom} <span className="text-[#EAB308]">&amp;</span>
          <br />
          {bride}
        </div>
        {date && <p className="mt-5 text-sm tracking-wide text-emerald-100">{date}</p>}

        {guestName && (
          <div className={`mt-7 max-w-sm p-5 ${CARD}`}>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Kepada Yth.</p>
            <p className="mt-1 break-words font-playfair text-xl text-emerald-50">{guestName}</p>
            <p className={`mt-1 text-xs ${MUTED}`}>Mohon maaf apabila ada kesalahan penulisan nama atau gelar.</p>
          </div>
        )}

        <button ref={buttonRef} type="button" onClick={onOpen} className={`${BTN_GOLD} mt-7 self-start px-8`}>
          Buka Undangan
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------- hero */

const Hero: React.FC<{ invitation: DigitalInvitation; badge: string; intro: string }> = ({
  invitation,
  badge,
  intro,
}) => {
  const groom = nick(invitation.groomNickName, "Mempelai Pria");
  const bride = nick(invitation.brideNickName, "Mempelai Wanita");
  const photo = invitation.heroPhotoUrl || invitation.coverPhotoUrl;
  const date = formatEventDate(invitation.akadDate ?? invitation.resepsiDate);

  return (
    <section aria-label="Pembuka" className="relative px-6 pb-16 pt-14">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-[55%]">
          <span className="inline-block rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
            {badge}
          </span>
          <p className={`mt-4 text-sm leading-relaxed ${MUTED}`}>{intro}</p>
        </div>
        <MonogramFrame className="h-24 w-24 shrink-0">
          <span className="font-playfair text-lg text-[#EAB308]">
            {groom.charAt(0).toUpperCase()}&amp;{bride.charAt(0).toUpperCase()}
          </span>
        </MonogramFrame>
      </div>

      <div className="relative mt-8 ml-auto w-[80%]">
        <div className="aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-2xl border border-emerald-700/40 bg-[#0A2218]">
          {photo ? (
            <img src={photo} alt={`Foto ${groom} dan ${bride}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-end justify-center bg-[radial-gradient(ellipse_at_50%_30%,#0F3A28,#061B13)]">
              <FernAccent className="h-48 w-16" />
            </div>
          )}
        </div>
        <FernAccent className="pointer-events-none absolute -left-8 bottom-4 h-40 w-14 -rotate-12" />
      </div>

      <div className="relative -mt-14 pr-6">
        <h1
          className={`font-great-vibes font-normal leading-[0.95] text-emerald-50 drop-shadow-[0_2px_12px_rgba(4,18,13,0.9)] ${scriptSize(groom, bride)}`}
        >
          {groom} <span className="text-[#EAB308]">&amp;</span>
          <br />
          <span className="ml-8">{bride}</span>
        </h1>
        {date && <p className="mt-5 text-sm tracking-wide text-emerald-100">{date}</p>}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ quote */

const Quote: React.FC<{ text: string; source: string | null }> = ({ text, source }) => (
  <section aria-label="Kutipan" className="px-6 py-14">
    <Reveal>
      <figure className="relative border-l border-[#EAB308]/50 pl-6">
        <svg viewBox="0 0 32 24" className="mb-4 h-6 w-8 text-[#EAB308]" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M0 24V13C0 5 4 1 11 0v4C7 5 6 8 6 11h5v13zM18 24V13c0-8 4-12 11-13v4c-4 1-5 4-5 7h5v13z" />
        </svg>
        <blockquote className="font-playfair text-lg italic leading-relaxed text-emerald-50 sm:text-xl">{text}</blockquote>
        {source && (
          <figcaption className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#EAB308]">{source}</figcaption>
        )}
      </figure>
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
  align: "left" | "right";
}

const Person: React.FC<PersonProps> = ({ role, fullName, photoUrl, father, mother, instagram, align }) => {
  const parents = [father?.trim(), mother?.trim()].filter(Boolean).join(" & ");
  const igUrl = instagramHref(instagram);
  const right = align === "right";
  return (
    <Reveal className={`flex flex-col ${right ? "items-end text-right" : "items-start text-left"}`}>
      <div className="relative w-[62%] max-w-[15rem]">
        <div className="aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-xl border border-emerald-700/40 bg-[#0A2218]">
          {photoUrl ? (
            <img src={photoUrl} alt={`Foto ${fullName}`} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-end justify-center bg-[radial-gradient(ellipse_at_50%_20%,#0F3A28,#061B13)]">
              <FernAccent className="h-32 w-12" />
            </div>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`absolute -bottom-3 h-6 w-6 rotate-45 border border-[#EAB308]/60 bg-[#04120D] ${right ? "-left-3" : "-right-3"}`}
        />
      </div>
      <h3 className="mt-6 text-balance font-playfair text-2xl leading-snug text-emerald-50">{fullName}</h3>
      {parents && (
        <p className={`mt-2 max-w-xs text-sm leading-relaxed ${MUTED}`}>
          {role} dari <span className="text-emerald-50">{parents}</span>
        </p>
      )}
      {igUrl && (
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm text-emerald-300 hover:text-[#EAB308] ${FOCUS}`}
        >
          <Icon d={ICON_IG} />@{instagram?.trim().replace(/^@/, "")}
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

const EventCard: React.FC<{ event: EventInfo; invitation: DigitalInvitation; couple: string; offset: string }> = ({
  event,
  invitation,
  couple,
  offset,
}) => {
  const calendarEvent: CalendarEvent = {
    title: `${event.label} ${couple}`,
    date: event.date,
    startTime: event.start,
    endTime: event.end,
    timezone: invitation.timezone,
    location: [event.venue, event.address].filter(Boolean).join(", "),
    description: `${event.label} ${invitation.title}`.trim(),
  };
  const calendarUrl = googleCalendarUrl(calendarEvent);
  const map = safeHref(event.mapUrl);

  return (
    <Reveal className={offset}>
      <article className={`relative overflow-hidden p-6 ${CARD}`}>
        <CornerLeaves position="tr" className="opacity-60" />
        <h3 className="pr-16 font-playfair text-2xl text-[#EAB308]">{event.label}</h3>
        <p className="mt-4 text-lg text-emerald-50">{formatEventDate(event.date)}</p>
        <p className={`mt-1 text-sm ${MUTED}`}>{formatTimeRange(event.start, event.end, invitation.timezone)}</p>
        {(event.venue || event.address) && (
          <div className="mt-5 border-t border-emerald-700/40 pt-5">
            {event.venue && <p className="font-semibold text-emerald-50">{event.venue}</p>}
            {event.address && <p className={`mt-1 text-sm leading-relaxed ${MUTED}`}>{event.address}</p>}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {map && (
            <a href={map} target="_blank" rel="noopener noreferrer" className={BTN_GOLD}>
              <Icon d={ICON_PIN} />
              Buka Peta
            </a>
          )}
          {calendarUrl && (
            <>
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={BTN_GHOST}>
                <Icon d={ICON_CAL} />
                Simpan ke Kalender
              </a>
              <button
                type="button"
                onClick={() => {
                  if (!downloadIcs(calendarEvent)) toast.error("Tanggal acara belum tersedia");
                }}
                className={BTN_GHOST}
              >
                <Icon d={ICON_DL} />
                Unduh .ics
              </button>
            </>
          )}
        </div>
      </article>
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
    <section aria-label="Hitung mundur" className="px-6 py-14">
      <Reveal>
        <div className="mb-8 flex items-center gap-4">
          <EucalyptusSprig />
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#EAB308]">Menuju Hari Bahagia</p>
        </div>
        {isOver ? (
          <p className="font-playfair text-2xl text-emerald-50">Hari bahagia telah tiba.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {units.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-t-full rounded-b-xl border border-emerald-700/40 bg-[#0A2218]/90 px-1 pb-3 pt-8"
              >
                <span className="font-playfair text-3xl tabular-nums text-emerald-50 sm:text-4xl">{pad2(value)}</span>
                <span className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-300">{label}</span>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
};

/* -------------------------------------------------------------- love story */

const LoveStory: React.FC<{ items: Array<{ year: string; title: string; story: string }> }> = ({ items }) => (
  <section aria-labelledby="nb-story" className="px-6 py-14">
    <SectionTitle title="Kisah Kami" id="nb-story" />
    <ol className="relative space-y-8 border-l border-emerald-500/30 pl-7">
      {items.map((item, i) => (
        <li key={`${item.year}-${i}`} className="relative">
          <span aria-hidden="true" className="absolute -left-[33px] top-1.5 h-3 w-3 rotate-45 bg-[#EAB308]" />
          <Reveal>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#EAB308]">{item.year}</p>
            <h3 className="mt-1 font-playfair text-xl text-emerald-50">{item.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${MUTED}`}>{item.story}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  </section>
);

/* ----------------------------------------------------------------- gallery */

const Gallery: React.FC<{ items: GalleryPhotoItem[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <section aria-labelledby="nb-gallery" className="px-6 py-14">
      <SectionTitle title="Galeri" id="nb-gallery" />
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <button
            key={`${item.url}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Buka foto ${i + 1}${item.caption ? `: ${item.caption}` : ""}`}
            className={`overflow-hidden border border-emerald-700/40 bg-[#0A2218] ${FOCUS} ${
              i % 5 === 0 ? "col-span-2 aspect-[16/10] rounded-t-[3rem] rounded-b-xl" : "aspect-square rounded-xl"
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
      toast.success("Nomor rekening tersalin");
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      toast.error("Gagal menyalin. Salin nomor secara manual.");
    }
  };

  return (
    <section aria-labelledby="nb-gift" className="px-6 py-14">
      <SectionTitle title="Tanda Kasih" id="nb-gift" />
      <p className={`mb-6 text-sm leading-relaxed ${MUTED}`}>{intro}</p>
      <div className="space-y-4">
        {accounts.map((acc, i) => {
          const key = `${acc.bankName}-${acc.accountNumber}-${i}`;
          return (
            <Reveal key={key}>
              <div className={`p-5 ${CARD}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#EAB308]">{acc.bankName}</p>
                    <p className="mt-2 break-all font-playfair text-2xl tabular-nums text-emerald-50">{acc.accountNumber}</p>
                    <p className={`mt-1 text-sm ${MUTED}`}>a.n. {acc.accountHolder}</p>
                  </div>
                  {acc.qrCodeUrl && (
                    <img src={acc.qrCodeUrl} alt={`Kode QR ${acc.bankName}`} loading="lazy" className="h-20 w-20 shrink-0 rounded-lg bg-white p-1" />
                  )}
                </div>
                <button type="button" onClick={() => void copy(acc.accountNumber, key)} className={`${BTN_GHOST} mt-4`}>
                  <Icon d={ICON_COPY} />
                  {copied === key ? "Tersalin" : "Salin Nomor"}
                </button>
              </div>
            </Reveal>
          );
        })}
        {address && (
          <Reveal>
            <div className={`p-5 ${CARD}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#EAB308]">Kirim Hadiah</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-emerald-50">{address}</p>
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
  { value: "tidak_hadir", label: "Tidak Hadir" },
  { value: "ragu", label: "Masih Ragu" },
];

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
  ragu: "Ragu",
};

const formatWishDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
};

const Rsvp: React.FC<Pick<InvitationThemeProps, "data" | "guest" | "rsvp">> = ({ data, guest, rsvp }) => {
  const form = useRsvpForm({ initialName: guest?.name, onSubmit: rsvp.submit });
  const labelCls = "mb-2 block text-sm font-medium text-emerald-50";

  return (
    <section aria-labelledby="nb-rsvp" className="px-6 py-14">
      <SectionTitle title="Konfirmasi Kehadiran" id="nb-rsvp" />
      <form onSubmit={(e) => void form.handleRsvpSubmit(e)} className={`space-y-5 p-6 ${CARD}`}>
        <div>
          <label htmlFor="nb-rsvp-name" className={labelCls}>Nama</label>
          <input id="nb-rsvp-name" type="text" autoComplete="name" required maxLength={100} value={form.rsvpName} onChange={(e) => form.setRsvpName(e.target.value)} placeholder="Nama lengkap Anda" className={FIELD} />
        </div>

        <fieldset>
          <legend className={labelCls}>Kehadiran</legend>
          <div className="grid grid-cols-3 gap-2">
            {ATTENDANCE.map((opt) => (
              <label key={opt.value} className="block cursor-pointer">
                <input
                  type="radio"
                  name="nb-rsvp-attendance"
                  value={opt.value}
                  checked={form.attendance === opt.value}
                  onChange={() => form.setAttendance(opt.value)}
                  className="peer sr-only"
                />
                <span className="flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-500/60 bg-[#061B13] px-2 text-center text-sm font-medium text-emerald-50 transition-colors hover:border-[#EAB308]/70 peer-checked:border-[#EAB308] peer-checked:bg-[#EAB308] peer-checked:text-[#04120D] peer-focus-visible:ring-2 peer-focus-visible:ring-[#EAB308] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#04120D]">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {form.attendance === "hadir" && (
          <div>
            <label htmlFor="nb-rsvp-count" className={labelCls}>Jumlah Tamu</label>
            <select id="nb-rsvp-count" value={form.guestCount} onChange={(e) => form.setGuestCount(Number(e.target.value))} className={FIELD}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} orang</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="nb-rsvp-msg" className={labelCls}>Doa &amp; Ucapan</label>
          <textarea id="nb-rsvp-msg" rows={4} maxLength={500} value={form.message} onChange={(e) => form.setMessage(e.target.value)} placeholder="Tulis doa dan ucapan untuk kedua mempelai" className={`${FIELD} resize-none py-3`} />
          <p className={`mt-1 text-right text-xs ${MUTED}`}>{form.message.length}/500</p>
        </div>

        <button type="submit" disabled={rsvp.isPending} className={`${BTN_GOLD} w-full`}>
          {rsvp.isPending ? "Mengirim..." : "Kirim Konfirmasi"}
        </button>
      </form>

      <h3 className="mt-12 font-playfair text-2xl text-emerald-50">Doa Restu dari Para Tamu ({data.rsvpTotal})</h3>
      {data.rsvps.length === 0 ? (
        <p className={`mt-4 text-sm ${MUTED}`}>Belum ada doa. Jadilah yang pertama menuliskan ucapan.</p>
      ) : (
        <ul className="mt-5 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {data.rsvps.map((w) => (
            <li key={w.id} className="rounded-2xl border border-emerald-700/40 bg-[#0A2218]/90 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="break-words font-semibold text-emerald-50">{w.guestName}</p>
                <span className="rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs text-emerald-300">{STATUS_LABEL[w.attendanceStatus]}</span>
              </div>
              {w.message?.trim() && (
                <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-emerald-100">{w.message}</p>
              )}
              {formatWishDate(w.createdAt) && <p className={`mt-2 text-xs ${MUTED}`}>{formatWishDate(w.createdAt)}</p>}
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
    className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#EAB308]/60 bg-[#0A2218] text-[#EAB308] shadow-lg shadow-black/40 hover:bg-[#0F3A28] ${FOCUS}`}
  >
    <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-current ${isPlaying ? "nb-eq h-full" : "h-1.5"}`}
          style={isPlaying ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </span>
  </button>
);

/* -------------------------------------------------------------------- root */

export const NocturneBotanicaTheme: React.FC<InvitationThemeProps> = ({ data, guest, music, copy, rsvp }) => {
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#04120D] font-sans text-emerald-50 antialiased">
      <NocturneKeyframes />
      <Fireflies count={8} className="fixed inset-0 z-0" />

      {!opened && <Cover invitation={invitation} guestName={guest?.name ?? null} onOpen={handleOpen} />}

      <main
        aria-hidden={!opened}
        style={{ visibility: opened ? "visible" : "hidden" }}
        className="relative z-10 mx-auto max-w-xl"
      >
        <Hero invitation={invitation} badge={copy.badge} intro={copy.coupleIntro} />

        {invitation.openingQuote?.trim() && <Quote text={invitation.openingQuote} source={invitation.quoteSource} />}

        <section aria-labelledby="nb-couple" className="px-6 py-14">
          <SectionTitle title="Dua Insan, Satu Taman" id="nb-couple" />
          <div className="space-y-14">
            <Person
              role="Putra"
              fullName={nick(invitation.groomFullName, groom)}
              photoUrl={invitation.groomPhotoUrl}
              father={invitation.groomFather}
              mother={invitation.groomMother}
              instagram={invitation.groomInstagram}
              align="left"
            />
            <Person
              role="Putri"
              fullName={nick(invitation.brideFullName, bride)}
              photoUrl={invitation.bridePhotoUrl}
              father={invitation.brideFather}
              mother={invitation.brideMother}
              instagram={invitation.brideInstagram}
              align="right"
            />
          </div>
        </section>

        <div className="flex justify-center py-2">
          <LeafSprigDivider />
        </div>

        {events.length > 0 && (
          <section aria-labelledby="nb-events" className="px-6 py-14">
            <SectionTitle title="Rangkaian Acara" id="nb-events" />
            <div className="space-y-6">
              {events.map((event, i) => (
                <EventCard key={event.label} event={event} invitation={invitation} couple={couple} offset={i % 2 === 0 ? "sm:mr-8" : "sm:ml-8"} />
              ))}
            </div>
          </section>
        )}

        <Countdown invitation={invitation} />

        {data.loveStories.length > 0 && <LoveStory items={data.loveStories} />}

        {data.gallery.length > 0 && <Gallery items={data.gallery} />}

        {hasGift && <Gift intro={copy.giftIntro} accounts={data.bankAccounts} address={invitation.giftAddress?.trim() || null} />}

        <Rsvp data={data} guest={guest} rsvp={rsvp} />

        <footer className="relative px-6 pb-28 pt-16 text-center">
          <div className="flex justify-center">
            <LeafSprigDivider />
          </div>
          <p className="mt-6 text-sm text-emerald-100">{copy.thanks}</p>
          <p
            className={`mt-3 text-balance break-words font-great-vibes leading-tight text-emerald-50 ${
              longestWordLength(groom, bride) > 13 ? "text-4xl" : "text-5xl"
            }`}
          >
            {couple}
          </p>
          <p className={`mt-10 text-xs ${MUTED}`}>Powered by WeddingPlan</p>
        </footer>
      </main>

      {opened && music.hasMusic && <MusicButton isPlaying={music.isPlaying} onToggle={music.toggle} />}
    </div>
  );
};
