import { useState } from "react";
import type React from "react";
import { toast } from "sonner";

export type AttendanceStatus = "hadir" | "tidak_hadir" | "ragu";

export interface RsvpPayload {
  guestName: string;
  attendanceStatus: AttendanceStatus;
  guestCount: number;
  message: string;
}

interface UseRsvpFormOptions {
  initialName?: string;
  onSubmit: (payload: RsvpPayload) => Promise<void>;
}

export const useRsvpForm = ({ initialName = "", onSubmit }: UseRsvpFormOptions) => {
  const [rsvpName, setRsvpName] = useState(initialName);
  const [attendance, setAttendance] = useState<AttendanceStatus>("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = rsvpName.trim();
    if (!name) {
      toast.error("Silakan isi nama Anda");
      return;
    }
    try {
      await onSubmit({
        guestName: name,
        attendanceStatus: attendance,
        guestCount: attendance === "hadir" ? guestCount : 1,
        message: message.trim(),
      });
      setMessage("");
      toast.success("Doa & konfirmasi terkirim", {
        description: "Terima kasih atas doa restu dan konfirmasi kehadiran Anda.",
      });
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(apiMessage || "Gagal mengirimkan konfirmasi. Coba lagi.");
    }
  };

  return {
    rsvpName,
    setRsvpName,
    attendance,
    setAttendance,
    guestCount,
    setGuestCount,
    message,
    setMessage,
    handleRsvpSubmit,
  };
};
