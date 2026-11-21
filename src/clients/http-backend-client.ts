import { ApiError, UpstreamError } from "../http/errors.js";
import type { AgentAnswer, Entity, ListResult, QueryParams, ResourceName } from "../types.js";
import type { BackendPort } from "./backend-port.js";

interface ErrorPayload {
  error?: { code?: string; message?: string };
}

interface ListEnvelope {
  items: Entity[];
  total: number;
  limit: number;
  offset: number;
}

/** Adaptador HTTP del backend interno. Traduce errores y normaliza respuestas. */
export class HttpBackendClient implements BackendPort {
  constructor(
    private readonly baseUrl: string,
    private readonly adminKey: string,
    private readonly timeoutMs = 12000,
  ) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    admin = false,
  ): Promise<T> {
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

  async list(resource: ResourceName, query: QueryParams): Promise<ListResult> {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") search.set(key, String(value));
    }
    const suffix = search.toString() ? `?${search.toString()}` : "";
    const payload = await this.request<ListEnvelope>("GET", `/internal/${resource}${suffix}`);
    return {
      data: payload.items,
      meta: { total: payload.total, limit: payload.limit, offset: payload.offset },
    };
  }

  async get(resource: ResourceName, id: string): Promise<Entity> {
    const payload = await this.request<{ data: Entity }>("GET", `/internal/${resource}/${encodeURIComponent(id)}`);
    return payload.data;
  }

  async create(resource: ResourceName, input: unknown): Promise<Entity> {
    const payload = await this.request<{ data: Entity }>("POST", `/internal/${resource}`, input, true);
    return payload.data;
  }

  async update(resource: ResourceName, id: string, patch: unknown): Promise<Entity> {
    const payload = await this.request<{ data: Entity }>(
      "PATCH",
      `/internal/${resource}/${encodeURIComponent(id)}`,
      patch,
      true,
    );
    return payload.data;
  }

  async remove(resource: ResourceName, id: string): Promise<void> {
    await this.request<void>("DELETE", `/internal/${resource}/${encodeURIComponent(id)}`, undefined, true);
  }

  async categories(): Promise<Entity[]> {
    const payload = await this.request<ListEnvelope>("GET", "/internal/categories");
    return payload.items;
  }

  stats(): Promise<Entity> {
    return this.request<Entity>("GET", "/internal/stats");
  }

  search(query: string, limit: number): Promise<Entity> {
    return this.request<Entity>("GET", `/internal/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  ask(question: string): Promise<AgentAnswer> {
    return this.request<AgentAnswer>("POST", "/internal/agent/ask", { question });
  }

  ping(): Promise<{ status: string; engine?: string }> {
    return this.request<{ status: string; engine?: string }>("GET", "/internal/health");
  }
}
