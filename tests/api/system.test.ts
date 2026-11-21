import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "../helpers/test-app.js";

describe("endpoints de sistema", () => {
  it("responde el health propio", async () => {
    const { app } = buildTestApp();
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("reporta el estado del backend", async () => {
    const { app, backend } = buildTestApp();
    const ok = await request(app).get("/api/v1/health");
    expect(ok.status).toBe(200);
    expect(ok.body.upstream.status).toBe("ok");

    backend.failNextPing = true;
    const down = await request(app).get("/api/v1/health");
    expect(down.status).toBe(503);
    expect(down.body.status).toBe("degraded");
  });

  it("expone categorias y estadisticas", async () => {
    const { app } = buildTestApp();
    const categories = await request(app).get("/api/v1/categories");
    expect(categories.status).toBe(200);
    expect(categories.body.data[0].slug).toBe("cai");

    const stats = await request(app).get("/api/v1/stats");
    expect(stats.status).toBe(200);
    expect(stats.body.totalRecords).toBe(75);
  });

  it("valida la busqueda", async () => {
    const { app } = buildTestApp();
    expect((await request(app).get("/api/v1/search")).status).toBe(400);
    const ok = await request(app).get("/api/v1/search?q=parque");
    expect(ok.status).toBe(200);
    expect(ok.body.query).toBe("parque");
  });

  it("valida y responde el agente", async () => {
    const { app } = buildTestApp();
    const empty = await request(app).post("/api/v1/agent/ask").send({ question: "" });
    expect(empty.status).toBe(400);

    const ok = await request(app)
      .post("/api/v1/agent/ask")
      .send({ question: "donde hay veterinarias" });
    expect(ok.status).toBe(200);
    expect(ok.body.answer).toBe("Respuesta de prueba");
    expect(ok.body.intents).toContain("veterinarias");
  });

  it("devuelve 404 JSON en rutas desconocidas", async () => {
    const { app } = buildTestApp();
    const response = await request(app).get("/api/v1/no-existe");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("not_found");
  });
});
