import type { AgentAnswer, Entity, ListResult, QueryParams, ResourceName } from "../types.js";
import type { BackendPort } from "./backend-port.js";
import { HttpJsonClient } from "./http-json.js";

interface ListEnvelope {
  items: Entity[];
  total: number;
  limit: number;
  offset: number;
}

/** Adaptador HTTP del backend interno. Traduce errores y normaliza respuestas. */
export class HttpBackendClient implements BackendPort {
  private readonly http: HttpJsonClient;

  constructor(baseUrl: string, adminKey: string, timeoutMs = 12000) {
    this.http = new HttpJsonClient(baseUrl, adminKey, timeoutMs);
  }

  async list(resource: ResourceName, query: QueryParams): Promise<ListResult> {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") search.set(key, String(value));
    }
    const suffix = search.toString() ? `?${search.toString()}` : "";
    const payload = await this.http.request<ListEnvelope>("GET", `/internal/${resource}${suffix}`);
    return {
      data: payload.items,
      meta: { total: payload.total, limit: payload.limit, offset: payload.offset },
    };
  }

  async get(resource: ResourceName, id: string): Promise<Entity> {
    const payload = await this.http.request<{ data: Entity }>(
      "GET",
      `/internal/${resource}/${encodeURIComponent(id)}`,
    );
    return payload.data;
  }

  async create(resource: ResourceName, input: unknown): Promise<Entity> {
    const payload = await this.http.request<{ data: Entity }>(
      "POST",
      `/internal/${resource}`,
      input,
      true,
    );
    return payload.data;
  }

  async update(resource: ResourceName, id: string, patch: unknown): Promise<Entity> {
    const payload = await this.http.request<{ data: Entity }>(
      "PATCH",
      `/internal/${resource}/${encodeURIComponent(id)}`,
      patch,
      true,
    );
    return payload.data;
  }

  async remove(resource: ResourceName, id: string): Promise<void> {
    await this.http.request<void>(
      "DELETE",
      `/internal/${resource}/${encodeURIComponent(id)}`,
      undefined,
      true,
    );
  }

  async categories(): Promise<Entity[]> {
    const payload = await this.http.request<ListEnvelope>("GET", "/internal/categories");
    return payload.items;
  }

  stats(): Promise<Entity> {
    return this.http.request<Entity>("GET", "/internal/stats");
  }

  search(query: string, limit: number): Promise<Entity> {
    return this.http.request<Entity>(
      "GET",
      `/internal/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
  }

  ask(question: string): Promise<AgentAnswer> {
    return this.http.request<AgentAnswer>("POST", "/internal/agent/ask", { question });
  }

  ping(): Promise<{ status: string; engine?: string }> {
    return this.http.request<{ status: string; engine?: string }>("GET", "/internal/health");
  }
}
