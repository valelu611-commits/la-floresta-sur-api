import type { RequestHandler } from "express";
import { ZodError, type ZodType } from "zod";
import { ValidationError } from "./errors.js";

function toDetails(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "(body)",
    message: issue.message,
  }));
}

/** Valida y normaliza el body; reemplaza req.body por el dato tipado. */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError("Datos invalidos", toDetails(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };
}

/** Valida query strings y deja los valores normalizados en req.query. */
export function validateQuery<T extends object>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError("Parametros invalidos", toDetails(result.error)));
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
