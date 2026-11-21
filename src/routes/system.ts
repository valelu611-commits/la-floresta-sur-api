import type { Express } from "express";
import type { BackendPort } from "../clients/backend-port.js";
import { asyncHandler } from "../http/guards.js";
import { validateBody, validateQuery } from "../http/validation.js";
import { agentAskSchema, searchQuerySchema, type AgentAskInput, type SearchQuery } from "../schemas/agent.js";

export function registerSystemRoutes(app: Express, backend: BackendPort): void {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "la-floresta-sur-api", timestamp: new Date().toISOString() });
  });

  app.get(
    "/api/v1/health",
    asyncHandler(async (_req, res) => {
      try {
        const upstream = await backend.ping();
        res.json({
          status: "ok",
          service: "la-floresta-sur-api",
          upstream,
          timestamp: new Date().toISOString(),
        });
      } catch {
        res.status(503).json({
          status: "degraded",
          service: "la-floresta-sur-api",
          upstream: { status: "down" },
        });
      }
    }),
  );

  app.get(
    "/api/v1/categories",
    asyncHandler(async (_req, res) => {
      res.json({ data: await backend.categories() });
    }),
  );

  app.get(
    "/api/v1/stats",
    asyncHandler(async (_req, res) => {
      res.json(await backend.stats());
    }),
  );

  app.get(
    "/api/v1/search",
    validateQuery(searchQuerySchema),
    asyncHandler(async (req, res) => {
      const query = req.query as unknown as SearchQuery;
      res.json(await backend.search(query.q, query.limit));
    }),
  );

  app.post(
    "/api/v1/agent/ask",
    validateBody(agentAskSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as AgentAskInput;
      res.json(await backend.ask(body.question));
    }),
  );
}
