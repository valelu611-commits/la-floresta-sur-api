export interface ApiEnv {
  nodeEnv: string;
  port: number;
  backendUrl: string;
  adminKey: string;
  corsOrigins: string[];
  rateLimitMax: number;
}

function parseList(raw: string | undefined, fallback: string[]): string[] {
  const value = (raw ?? "").trim();
  if (value === "") return fallback;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

/** Configuracion de la API publica, validada al arrancar. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const backendUrl = (source.BACKEND_URL ?? "http://localhost:4000").replace(/\/+$/, "");
  if (!/^https?:\/\//.test(backendUrl)) {
    throw new Error("BACKEND_URL debe iniciar con http:// o https://");
  }
  const rateLimitMax = Number(source.RATE_LIMIT_MAX ?? 600);
  return {
    nodeEnv: source.NODE_ENV ?? "development",
    port: Number(source.PORT ?? 3000),
    backendUrl,
    adminKey: source.ADMIN_API_KEY?.trim() || "dev-admin-key",
    corsOrigins: parseList(source.CORS_ORIGINS, ["*"]),
    rateLimitMax: Number.isFinite(rateLimitMax) ? rateLimitMax : 600,
  };
}
