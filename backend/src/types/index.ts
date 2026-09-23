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
