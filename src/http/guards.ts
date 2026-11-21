import type { NextFunction, Request, RequestHandler, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { UnauthorizedError } from "./errors.js";

export type AsyncHandler = (req: Request, res: Response) => Promise<void>;

export function asyncHandler(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res).catch(next);
  };
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Exige x-admin-key valida para escrituras (comparacion en tiempo constante). */
export function requireAdmin(adminKey: string): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const provided = req.header("x-admin-key") ?? "";
    if (provided === "" || !safeEqual(provided, adminKey)) {
      next(new UnauthorizedError());
      return;
    }
    next();
  };
}
