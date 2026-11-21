import request from "supertest";
import { describe, expect, it } from "vitest";
import { ADMIN_KEY, buildTestApp } from "../helpers/test-app.js";

describe("CRUD de los otros cuatro recursos", () => {
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

  it("rechaza un incidente con severidad invalida", async () => {
    const { app } = buildTestApp();
    const response = await request(app)
      .post("/api/v1/security-incidents")
      .set("x-admin-key", ADMIN_KEY)
      .send({
        title: "Hurto de prueba",
        kind: "hurto_persona",
        occurredAt: "2026-11-01",
        placeHint: "Parque",
        lat: 4.6113,
        lon: -74.1508,
        severity: "extrema",
      });
    expect(response.status).toBe(400);
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

  it("rechaza estrato fuera de rango y localidad incompleta", async () => {
    const { app } = buildTestApp();
    const badStratum = await request(app)
      .post("/api/v1/cadastral-properties")
      .set("x-admin-key", ADMIN_KEY)
      .send({
        address: "Calle 49 Sur # 87-12",
        stratum: 9,
        landUse: "comercial",
        areaM2: 96,
        cadastralRef: "79-05-0123-0001",
        lat: 4.6108,
        lon: -74.1519,
      });
    expect(badStratum.status).toBe(400);

    const badLocality = await request(app)
      .post("/api/v1/localities")
      .set("x-admin-key", ADMIN_KEY)
      .send({ name: "Kennedy", lat: 4.62, lon: -74.14 });
    expect(badLocality.status).toBe(400);
  });

  it("lista y filtra cada recurso", async () => {
    const { app } = buildTestApp();
    const urls = [
      "/api/v1/security-incidents?severity=alta",
      "/api/v1/road-segments?condition=deteriorado",
      "/api/v1/cadastral-properties?landUse=comercial",
      "/api/v1/localities?code=08",
    ];
    for (const url of urls) {
      const response = await request(app).get(url);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });
});
