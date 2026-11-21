import request from "supertest";
import { describe, expect, it } from "vitest";
import { ADMIN_KEY, buildTestApp } from "../helpers/test-app.js";

describe("creacion de los otros recursos", () => {
  it("crea un incidente valido", async () => {
    const { app } = buildTestApp();
    const response = await request(app)
      .post("/api/v1/security-incidents")
      .set("x-admin-key", ADMIN_KEY)
      .send({
        title: "Hurto de prueba",
        kind: "hurto_persona",
        occurredAt: "2026-11-01",
        placeHint: "Parque principal",
        lat: 4.6113,
        lon: -74.1508,
        severity: "media",
      });
    expect(response.status).toBe(201);
    expect(response.body.data.kind).toBe("hurto_persona");
  });

  it("crea un tramo vial y un predio", async () => {
    const { app } = buildTestApp();
    const road = await request(app)
      .post("/api/v1/road-segments")
      .set("x-admin-key", ADMIN_KEY)
      .send({
        name: "Calle 50 Sur",
        condition: "regular",
        status: "obras",
        lengthM: 320,
        lat: 4.6116,
        lon: -74.1508,
      });
    expect(road.status).toBe(201);

    const property = await request(app)
      .post("/api/v1/cadastral-properties")
      .set("x-admin-key", ADMIN_KEY)
      .send({
        address: "Calle 49 Sur # 87-12",
        stratum: 2,
        landUse: "comercial",
        areaM2: 96,
        cadastralRef: "79-05-0123-0001",
        lat: 4.6108,
        lon: -74.1519,
      });
    expect(property.status).toBe(201);
  });
});
