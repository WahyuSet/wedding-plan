import { Router } from "express";
import {
  getOperasionalTasks,
  createOperasionalTask,
  updateOperasionalTask,
  deleteOperasionalTask,
  resetOperasionalTasks,
  operasionalTaskSchema,
  updateOperasionalTaskSchema,
} from "../controllers/operasional.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware, requireProfile } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware, requireProfile);

router.get("/", getOperasionalTasks);
router.post("/", validate(operasionalTaskSchema), createOperasionalTask);
router.post("/reset", resetOperasionalTasks);
router.put("/:id", validate(updateOperasionalTaskSchema), updateOperasionalTask);
router.delete("/:id", deleteOperasionalTask);

export default router;
