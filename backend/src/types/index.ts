import { Request } from "express";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  profileId: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}
