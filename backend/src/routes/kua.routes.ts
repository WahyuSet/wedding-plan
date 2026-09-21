import { Router } from "express";
import {
  getKuaDocuments,
  createKuaDocument,
  updateKuaDocument,
  deleteKuaDocument,
  resetKuaDocuments,
  kuaDocumentSchema,
  updateKuaDocumentSchema,
} from "../controllers/kua.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getKuaDocuments);
router.post("/", validate(kuaDocumentSchema), createKuaDocument);
router.post("/reset", resetKuaDocuments);
router.put("/:id", validate(updateKuaDocumentSchema), updateKuaDocument);
router.delete("/:id", deleteKuaDocument);

export default router;
