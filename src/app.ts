import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import type { BackendPort } from "./clients/backend-port.js";
import type { ApiEnv } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./http/error-handler.js";
import { registerResourceRoutes } from "./routes/resources.js";
import { registerSystemRoutes } from "./routes/system.js";

export interface AppDeps {
  backend: BackendPort;
  env: ApiEnv;
}

/** Composition root de la API: middleware, rutas y manejo de errores. */
export function createApp({ backend, env }: AppDeps): Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.corsOrigins.includes("*") ? true : env.corsOrigins,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["content-type", "x-admin-key"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: env.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => env.nodeEnv === "test",
    }),
  );

  registerSystemRoutes(app, backend);
  registerResourceRoutes(app, backend, env.adminKey);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
