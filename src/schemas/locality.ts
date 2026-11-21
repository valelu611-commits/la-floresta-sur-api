import { z } from "zod";
import { BOGOTA_LAT, BOGOTA_LON, commonQuerySchema } from "./common.js";

export const localityCreateSchema = z
  .object({
    name: z.string().trim().min(3).max(160),
    code: z.string().trim().min(1).max(20),
    mayor: z.string().max(160).optional(),
    population: z.number().int().min(0).max(5000000),
    areaHa: z.number().min(1).max(20000),
    upz: z.string().max(120).optional(),
    description: z.string().max(2000).optional(),
    lat: z.number().min(BOGOTA_LAT.min).max(BOGOTA_LAT.max),
    lon: z.number().min(BOGOTA_LON.min).max(BOGOTA_LON.max),
    bbox: z.string().max(120).optional(),
    source: z.string().max(240).optional(),
  })
  .strict();

export const localityUpdateSchema = localityCreateSchema.partial();

export const localityQuerySchema = commonQuerySchema.extend({
  code: z.string().max(20).optional(),
});

export type LocalityInput = z.infer<typeof localityCreateSchema>;
