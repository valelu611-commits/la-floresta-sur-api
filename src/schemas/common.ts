import { z } from "zod";

export const BOGOTA_LAT = { min: 4.45, max: 4.84 };
export const BOGOTA_LON = { min: -74.25, max: -74.0 };

export const BBOX_PATTERN =
  /^-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/;

export const commonQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  bbox: z.string().regex(BBOX_PATTERN, "bbox debe ser minLon,minLat,maxLon,maxLat").optional(),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(4).max(64),
});

export const bboxSchema = z.string().regex(BBOX_PATTERN).optional();
