import type { Express } from "express";
import type { BackendPort } from "../clients/backend-port.js";
import { registerCrudRoutes } from "./crud-router.js";
import {
  cadastralCreateSchema,
  cadastralQuerySchema,
  cadastralUpdateSchema,
} from "../schemas/cadastral-property.js";
import { incidentCreateSchema, incidentQuerySchema, incidentUpdateSchema } from "../schemas/security-incident.js";
import { localityCreateSchema, localityQuerySchema, localityUpdateSchema } from "../schemas/locality.js";
import { placeCreateSchema, placeQuerySchema, placeUpdateSchema } from "../schemas/place.js";
import { roadCreateSchema, roadQuerySchema, roadUpdateSchema } from "../schemas/road-segment.js";

/** Registra los cinco recursos con CRUD completo. */
export function registerResourceRoutes(app: Express, backend: BackendPort, adminKey: string): void {
  registerCrudRoutes(app, backend, adminKey, {
    resource: "places",
    querySchema: placeQuerySchema,
    createSchema: placeCreateSchema,
    updateSchema: placeUpdateSchema,
  });

  registerCrudRoutes(app, backend, adminKey, {
    resource: "security-incidents",
    querySchema: incidentQuerySchema,
    createSchema: incidentCreateSchema,
    updateSchema: incidentUpdateSchema,
  });

  registerCrudRoutes(app, backend, adminKey, {
    resource: "road-segments",
    querySchema: roadQuerySchema,
    createSchema: roadCreateSchema,
    updateSchema: roadUpdateSchema,
  });

  registerCrudRoutes(app, backend, adminKey, {
    resource: "cadastral-properties",
    querySchema: cadastralQuerySchema,
    createSchema: cadastralCreateSchema,
    updateSchema: cadastralUpdateSchema,
  });

  registerCrudRoutes(app, backend, adminKey, {
    resource: "localities",
    querySchema: localityQuerySchema,
    createSchema: localityCreateSchema,
    updateSchema: localityUpdateSchema,
  });
}
