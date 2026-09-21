import { Router } from "express";
import {
  getSeserahanItems,
  getSeserahanTemplates,
  importSeserahanTemplates,
  createSeserahanItem,
  updateSeserahanItem,
  deleteSeserahanItem,
  seserahanItemSchema,
  updateSeserahanItemSchema,
  importTemplatesSchema,
} from "../controllers/seserahan.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getSeserahanItems);
router.get("/templates", getSeserahanTemplates);
router.post("/import-templates", validate(importTemplatesSchema), importSeserahanTemplates);
router.post("/", validate(seserahanItemSchema), createSeserahanItem);
router.put("/:id", validate(updateSeserahanItemSchema), updateSeserahanItem);
router.delete("/:id", deleteSeserahanItem);

export default router;
