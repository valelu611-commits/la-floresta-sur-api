import type { ErrorRequestHandler, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "./errors.js";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: { code: "not_found", message: "Endpoint no encontrado. Revisa /api/v1 en la documentacion." },
  });
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    if (error.statusCode >= 500) console.error("[api]", error.message);
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: { code: "validation_error", message: "Datos invalidos", details: error.issues },
    });
    return;
  }

  console.error("[api] error no controlado", error);
  res.status(500).json({ error: { code: "internal_error", message: "Error interno" } });
};
