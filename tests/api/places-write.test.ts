import request from "supertest";
import { describe, expect, it } from "vitest";
import { ADMIN_KEY, buildTestApp } from "../helpers/test-app.js";

const validPlace = {
  categorySlug: "veterinarias",
  name: "Veterinaria de prueba",
  address: "Calle 49 Sur # 87-12",
  lat: 4.6112,
  lon: -74.1508,
};

describe("escrituras de /api/v1/places", () => {
  it("exige x-admin-key", async () => {
    const { app } = buildTestApp();
    expect((await request(app).post("/api/v1/places").send(validPlace)).status).toBe(401);
    const wrong = await request(app)
      .post("/api/v1/places")
      .set("x-admin-key", "otra")
      .send(validPlace);
    expect(wrong.status).toBe(401);
  });

  it("crea un lugar valido con 201", async () => {
    const { app, backend } = buildTestApp();
    const response = await request(app)
      .post("/api/v1/places")
      .set("x-admin-key", ADMIN_KEY)
      .send(validPlace);
    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe("created-1");
    expect(backend.created[0]?.resource).toBe("places");
  });

  it("valida coordenadas, campos requeridos y campos extra", async () => {
    const { app } = buildTestApp();
    const badLat = await request(app)
      .post("/api/v1/places")
      .set("x-admin-key", ADMIN_KEY)
      .send({ ...validPlace, lat: 40.4 });
    expect(badLat.status).toBe(400);
    expect(badLat.body.error.details[0].field).toBe("lat");

    const extra = await request(app)
      .post("/api/v1/places")
      .set("x-admin-key", ADMIN_KEY)
      .send({ ...validPlace, hack: true });
    expect(extra.status).toBe(400);

    const missing = await request(app)
      .post("/api/v1/places")
      .set("x-admin-key", ADMIN_KEY)
      .send({ categorySlug: "cai" });
    expect(missing.status).toBe(400);
  });

  it("actualiza y borra con la clave correcta", async () => {
    const { app, backend } = buildTestApp();
    const patch = await request(app)
      .patch("/api/v1/places/abc-123")
      .set("x-admin-key", ADMIN_KEY)
      .send({ hours: "Lun-Sab 8:00-18:00" });
    expect(patch.status).toBe(200);
    expect(patch.body.data.hours).toBe("Lun-Sab 8:00-18:00");

    const remove = await request(app)
      .delete("/api/v1/places/abc-123")
      .set("x-admin-key", ADMIN_KEY);
    expect(remove.status).toBe(204);
    expect(backend.removed).toContain("abc-123");
  });
});
