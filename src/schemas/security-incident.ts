import { z } from "zod";
import { BOGOTA_LAT, BOGOTA_LON, commonQuerySchema } from "./common.js";

export const INCIDENT_KINDS = [
  "hurto_persona",
  "hurto_residencia",
  "hurto_comercio",
  "hurto_bicicleta",
  "hurto_moto",
  "hurto_celular",
  "vandalismo",
  "rina",
  "otro",
] as const;

export const incidentCreateSchema = z
  .object({
    title: z.string().trim().min(4).max(180),
    kind: z.enum(INCIDENT_KINDS),
    occurredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "occurredAt debe ser YYYY-MM-DD"),
    timeRange: z.string().max(40).optional(),
    placeHint: z.string().trim().min(3).max(180),
    lat: z.number().min(BOGOTA_LAT.min).max(BOGOTA_LAT.max),
    lon: z.number().min(BOGOTA_LON.min).max(BOGOTA_LON.max),
    severity: z.enum(["baja", "media", "alta"]),
    weapon: z.string().max(60).optional(),
    description: z.string().max(2000).optional(),
    source: z.string().max(240).optional(),
  })
  .strict();

export const incidentUpdateSchema = incidentCreateSchema.partial();

export const incidentQuerySchema = commonQuerySchema.extend({
  kind: z.enum(INCIDENT_KINDS).optional(),
  severity: z.enum(["baja", "media", "alta"]).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type IncidentInput = z.infer<typeof incidentCreateSchema>;
