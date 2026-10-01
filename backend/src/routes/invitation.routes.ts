import { Router } from "express";
import { authMiddleware, requireProfile } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireFlag } from "../middleware/flags.middleware.js";
import { rsvpLimiter, uploadLimiter } from "../middleware/rateLimit.middleware.js";
import { deleteAsset, listAssets, singleFileUpload, uploadAsset } from "../controllers/upload.controller.js";
import {
  getInvitationConfig,
  updateInvitationConfig,
  addGuest,
  updateGuest,
  bulkAddGuests,
  exportGuestsCsv,
  getPublicGuest,
  deleteGuest,
  deleteRsvp,
  getPublicInvitation,
  submitPublicRsvp,
  invitationConfigSchema,
  guestSchema,
  updateGuestSchema,
  bulkGuestSchema,
  publicRsvpSchema,
} from "../controllers/invitation.controller.js";

const router = Router();

router.use(requireFlag("digital_invitation"));

// ─────────────────────────────────────────────
// Public Routes (Accessible without login)
// ─────────────────────────────────────────────
router.get("/public/:slug", getPublicInvitation);
router.get("/public/:slug/guests/:guestKey", getPublicGuest);
router.post("/public/:slug/rsvp", rsvpLimiter, validate(publicRsvpSchema), submitPublicRsvp);

// ─────────────────────────────────────────────
// Private Admin Routes (Wedding Planner User)
// ─────────────────────────────────────────────
router.use(authMiddleware, requireProfile);

router.get("/config", getInvitationConfig);
router.put("/config", validate(invitationConfigSchema), updateInvitationConfig);
router.post("/guests", validate(guestSchema), addGuest);
router.post("/guests/bulk", validate(bulkGuestSchema), bulkAddGuests);
router.get("/guests/export", exportGuestsCsv);
router.patch("/guests/:guestId", validate(updateGuestSchema), updateGuest);
router.delete("/guests/:guestId", deleteGuest);
router.delete("/rsvps/:rsvpId", deleteRsvp);

router.get("/uploads", listAssets);
router.post("/uploads", uploadLimiter, singleFileUpload, uploadAsset);
router.delete("/uploads/:assetId", deleteAsset);

export default router;
