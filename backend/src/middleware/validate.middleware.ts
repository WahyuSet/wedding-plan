import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

export const validate =
  (schema: ZodType<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res.status(400).json({
          success: false,
          message: "Data yang dikirim tidak valid.",
          errors: errorMessages,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada validasi data.",
      });
    }
  };
