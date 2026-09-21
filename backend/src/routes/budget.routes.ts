import { Router } from "express";
import {
  getBudgetItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  budgetItemSchema,
  updateBudgetItemSchema,
} from "../controllers/budget.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getBudgetItems);
router.post("/", validate(budgetItemSchema), createBudgetItem);
router.put("/:id", validate(updateBudgetItemSchema), updateBudgetItem);
router.delete("/:id", deleteBudgetItem);

export default router;
