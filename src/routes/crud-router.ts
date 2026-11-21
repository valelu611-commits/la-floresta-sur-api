import type { Express } from "express";
import type { ZodType } from "zod";
import type { BackendPort } from "../clients/backend-port.js";
import type { QueryParams, ResourceName } from "../types.js";
import { asyncHandler, requireAdmin } from "../http/guards.js";
import { validateBody, validateQuery } from "../http/validation.js";

export interface CrudConfig<TInput extends object> {
  resource: ResourceName;
  querySchema: ZodType<object>;
  createSchema: ZodType<TInput>;
  updateSchema: ZodType<Partial<TInput>>;
}

/**
 * Monta el CRUD REST de un recurso. La validacion ocurre antes de tocar el backend
 * (SRP) y las rutas solo hablan con el puerto BackendPort (DIP).
 */
export function registerCrudRoutes<TInput extends object>(
  app: Express,
  backend: BackendPort,
  adminKey: string,
  config: CrudConfig<TInput>,
): void {
  const base = `/api/v1/${config.resource}`;

  app.get(
    base,
    validateQuery(config.querySchema),
    asyncHandler(async (req, res) => {
      res.json(await backend.list(config.resource, req.query as QueryParams));
    }),
  );

  app.get(
    `${base}/:id`,
    asyncHandler(async (req, res) => {
      res.json({ data: await backend.get(config.resource, req.params.id) });
    }),
  );

  app.post(
    base,
    requireAdmin(adminKey),
    validateBody(config.createSchema),
    asyncHandler(async (req, res) => {
      res.status(201).json({ data: await backend.create(config.resource, req.body) });
    }),
  );

  app.patch(
    `${base}/:id`,
    requireAdmin(adminKey),
    validateBody(config.updateSchema),
    asyncHandler(async (req, res) => {
      res.json({ data: await backend.update(config.resource, req.params.id, req.body) });
    }),
  );

  app.delete(
    `${base}/:id`,
    requireAdmin(adminKey),
    asyncHandler(async (req, res) => {
      await backend.remove(config.resource, req.params.id);
      res.status(204).send();
    }),
  );
}
