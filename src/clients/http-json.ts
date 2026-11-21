import { ApiError, UpstreamError } from "../http/errors.js";

interface ErrorPayload {
  error?: { code?: string; message?: string };
}

/** Cliente JSON de bajo nivel: timeouts, cabeceras y traduccion de errores. */
export class HttpJsonClient {
  constructor(
    private readonly baseUrl: string,
    private readonly adminKey: string,
    private readonly timeoutMs = 12000,
  ) {}

  async request<T>(method: string, path: string, body?: unknown, admin = false): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          "content-type": "application/json",
          ...(admin ? { "x-admin-key": this.adminKey } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      if (response.status === 204) return undefined as T;
      const payload = (await response.json().catch(() => null)) as (T & ErrorPayload) | null;
      if (!response.ok) {
        const error = payload?.error;
        throw new ApiError(
          response.status,
          error?.code ?? "backend_error",
          error?.message ?? "Error del servicio de datos",
        );
      }
      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new UpstreamError("El servicio de datos no responde");
    } finally {
      clearTimeout(timer);
    }
  }
}
