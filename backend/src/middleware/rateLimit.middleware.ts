import type { Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { isTest } from "../config/env.js";

const skipInTests = (): boolean => isTest && process.env.ENABLE_RATE_LIMIT !== "true";

const tooMany = (message: string) => ({ success: false, message });

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: tooMany("Terlalu banyak permintaan. Coba lagi sebentar lagi."),
});

// Login & register: ketat untuk menahan brute-force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: tooMany("Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit."),
});

// RSVP publik per IP + slug.
export const rsvpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  keyGenerator: (req: Request) => `${ipKeyGenerator(req.ip ?? "")}:${req.params.slug ?? ""}`,
  message: tooMany("Terlalu banyak kiriman ucapan dari perangkat ini. Coba lagi nanti."),
});

export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: tooMany("Terlalu banyak upload. Coba lagi nanti."),
});
