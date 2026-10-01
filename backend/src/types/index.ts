import { Request } from "express";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  profileId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Dipakai handler yang berjalan setelah requireProfile: profileId dijamin ada.
// `user` tetap opsional agar kompatibel dengan tipe RequestHandler Express.
export interface ProfileRequest extends Request {
  user?: AuthenticatedUser & { profileId: string };
}
