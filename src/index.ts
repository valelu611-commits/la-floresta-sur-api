import "dotenv/config";
import { createApp } from "./app.js";
import { HttpBackendClient } from "./clients/http-backend-client.js";
import { loadEnv } from "./config/env.js";

const env = loadEnv();
const backend = new HttpBackendClient(env.backendUrl, env.adminKey);
const app = createApp({ backend, env });

const server = app.listen(env.port, () => {
  console.log(`[api] escuchando en http://localhost:${env.port}/api/v1`);
  console.log(`[api] backend: ${env.backendUrl}`);
});

function shutdown(signal: string): void {
  console.log(`[api] ${signal} recibido, cerrando...`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
