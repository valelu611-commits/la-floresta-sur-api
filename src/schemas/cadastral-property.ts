import { z } from "zod";
import { BOGOTA_LAT, BOGOTA_LON, commonQuerySchema } from "./common.js";

export const LAND_USES = [
  "residencial",
  "comercial",
  "mixto",
  "institucional",
  "dotacional",
] as const;

export const cadastralCreateSchema = z
  .object({
    address: z.string().trim().min(3).max(240),
    upz: z.string().max(60).optional(),
    barrio: z.string().max(120).optional(),
    stratum: z.number().int().min(1).max(6),
    landUse: z.enum(LAND_USES),
    areaM2: z.number().min(1).max(500000),
    cadastralRef: z.string().trim().min(4).max(60),
    lat: z.number().min(BOGOTA_LAT.min).max(BOGOTA_LAT.max),
    lon: z.number().min(BOGOTA_LON.min).max(BOGOTA_LON.max),
    notes: z.string().max(2000).optional(),
    source: z.string().max(240).optional(),
  })
  .strict();

export const cadastralUpdateSchema = cadastralCreateSchema.partial();

export const cadastralQuerySchema = commonQuerySchema.extend({
  stratum: z.coerce.number().int().min(1).max(6).optional(),
  landUse: z.enum(LAND_USES).optional(),
  upz: z.string().max(60).optional(),
});

export type CadastralInput = z.infer<typeof cadastralCreateSchema>;
