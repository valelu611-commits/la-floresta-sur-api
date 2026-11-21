import { z } from "zod";
import { BOGOTA_LAT, BOGOTA_LON, commonQuerySchema } from "./common.js";

export const roadCreateSchema = z
  .object({
    name: z.string().trim().min(3).max(160),
    fromStreet: z.string().max(160).optional(),
    toStreet: z.string().max(160).optional(),
    condition: z.enum(["bueno", "regular", "deteriorado"]),
    status: z.enum(["transitable", "obras", "cerrada"]),
    lengthM: z.number().min(1).max(50000),
    lat: z.number().min(BOGOTA_LAT.min).max(BOGOTA_LAT.max),
    lon: z.number().min(BOGOTA_LON.min).max(BOGOTA_LON.max),
    geomWkt: z.string().max(2000).optional(),
    lastReportedAt: z.string().max(32).optional(),
    description: z.string().max(2000).optional(),
    source: z.string().max(240).optional(),
  })
  .strict();

export const roadUpdateSchema = roadCreateSchema.partial();

export const roadQuerySchema = commonQuerySchema.extend({
  condition: z.enum(["bueno", "regular", "deteriorado"]).optional(),
  status: z.enum(["transitable", "obras", "cerrada"]).optional(),
});

export type RoadInput = z.infer<typeof roadCreateSchema>;
