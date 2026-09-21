import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getInvitationConfig,
  updateInvitationConfig,
  addGuest,
  deleteGuest,
  deleteRsvp,
  getPublicInvitation,
  submitPublicRsvp,
} from "../controllers/invitation.controller.js";

const router = Router();

// ─────────────────────────────────────────────
// Public Routes (Accessible without login)
// ─────────────────────────────────────────────
router.get("/public/:slug", getPublicInvitation);
router.post("/public/:slug/rsvp", submitPublicRsvp);

// ─────────────────────────────────────────────
// Private Admin Routes (Wedding Planner User)
// ─────────────────────────────────────────────
router.use(authMiddleware);

router.get("/config", getInvitationConfig);
router.put("/config", updateInvitationConfig);
router.post("/guests", addGuest);
router.delete("/guests/:guestId", deleteGuest);
router.delete("/rsvps/:rsvpId", deleteRsvp);

export default router;
