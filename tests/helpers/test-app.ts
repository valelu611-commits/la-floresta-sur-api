import { createApp } from "../../src/app.js";
import { loadEnv } from "../../src/config/env.js";
import { FakeBackend } from "./fake-backend.js";

export const ADMIN_KEY = "clave-de-prueba";

export function buildTestApp() {
  const backend = new FakeBackend();
  const env = loadEnv({ NODE_ENV: "test", ADMIN_API_KEY: ADMIN_KEY, RATE_LIMIT_MAX: "10000" });
  const app = createApp({ backend, env });
  return { app, backend };
}
