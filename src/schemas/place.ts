import { z } from "zod";
import { BOGOTA_LAT, BOGOTA_LON, commonQuerySchema } from "./common.js";

export const PLACE_CATEGORIES = [
  "librerias",
  "cai",
  "camaras",
  "comida",
  "veterinarias",
  "zonas-verdes",
  "transporte",
  "deportes",
  "educacion",
] as const;

export const placeCreateSchema = z
  .object({
    categorySlug: z.enum(PLACE_CATEGORIES),
    name: z.string().trim().min(2).max(160),
    address: z.string().trim().min(3).max(240),
    lat: z.number().min(BOGOTA_LAT.min).max(BOGOTA_LAT.max),
    lon: z.number().min(BOGOTA_LON.min).max(BOGOTA_LON.max),
    description: z.string().max(2000).optional(),
    phone: z.string().max(60).optional(),
    website: z.string().max(240).optional(),
    hours: z.string().max(120).optional(),
    metadata: z.record(z.unknown()).optional(),
    source: z.string().max(240).optional(),
    verified: z.boolean().optional(),
  })
  .strict();

export const placeUpdateSchema = placeCreateSchema.partial();

export const placeQuerySchema = commonQuerySchema.extend({
  category: z.enum(PLACE_CATEGORIES).optional(),
});

export type PlaceInput = z.infer<typeof placeCreateSchema>;
export type PlaceUpdate = z.infer<typeof placeUpdateSchema>;
export type PlaceQuery = z.infer<typeof placeQuerySchema>;
