import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "../helpers/test-app.js";

describe("GET /api/v1/places", () => {
  it("devuelve data y meta con paginacion", async () => {
    const { app } = buildTestApp();
    const response = await request(app).get("/api/v1/places?limit=5&offset=2");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta).toEqual({ total: 1, limit: 5, offset: 2 });
  });

  it("aplica limites por defecto y rechaza limit excesivo", async () => {
    const { app, backend } = buildTestApp();
    await request(app).get("/api/v1/places");
    expect(backend.lastQuery.limit).toBe(20);
    expect(backend.lastQuery.offset).toBe(0);

    const invalid = await request(app).get("/api/v1/places?limit=500");
    expect(invalid.status).toBe(400);
  });

  it("rechaza categoria desconocida y bbox mal formado", async () => {
    const { app } = buildTestApp();
    expect((await request(app).get("/api/v1/places?category=seguridad")).status).toBe(400);
    expect((await request(app).get("/api/v1/places?bbox=1,2,3")).status).toBe(400);
  });

  it("propaga 404 del backend", async () => {
    const { app } = buildTestApp();
    const response = await request(app).get("/api/v1/places/missing");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("not_found");
  });
});
