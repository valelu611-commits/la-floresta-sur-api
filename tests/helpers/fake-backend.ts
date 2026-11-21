import type { BackendPort } from "../../src/clients/backend-port.js";
import { ApiError } from "../../src/http/errors.js";
import type { AgentAnswer, Entity, ListResult, QueryParams, ResourceName } from "../../src/types.js";

/** Backend falso para probar la API sin red ni base de datos (DIP en accion). */
export class FakeBackend implements BackendPort {
  readonly created: Array<{ resource: ResourceName; input: unknown }> = [];
  readonly removed: string[] = [];
  lastQuery: QueryParams = {};
  failNextPing = false;

  async list(resource: ResourceName, query: QueryParams): Promise<ListResult> {
    this.lastQuery = query;
    return {
      data: [{ id: "seed-1", resource, name: "Registro de prueba" }],
      meta: {
        total: 1,
        limit: Number(query.limit ?? 20),
        offset: Number(query.offset ?? 0),
      },
    };
  }

  async get(_resource: ResourceName, id: string): Promise<Entity> {
    if (id === "missing") throw new ApiError(404, "not_found", "no existe");
    return { id, name: "Registro de prueba" };
  }

  async create(resource: ResourceName, input: unknown): Promise<Entity> {
    this.created.push({ resource, input });
    return { id: "created-1", ...(input as object) };
  }

  async update(_resource: ResourceName, id: string, patch: unknown): Promise<Entity> {
    return { id, ...(patch as object) };
  }

  async remove(_resource: ResourceName, id: string): Promise<void> {
    this.removed.push(id);
  }

  async categories(): Promise<Entity[]> {
    return [{ slug: "cai", name: "CAI" }];
  }

  async stats(): Promise<Entity> {
    return { barrio: "La Floresta Sur", totalRecords: 75, categories: [] };
  }

  async search(query: string, limit: number): Promise<Entity> {
    return { query, limit, total: 0, hits: [] };
  }

  async ask(question: string): Promise<AgentAnswer> {
    return {
      question,
      answer: "Respuesta de prueba",
      generatedBy: "rules",
      intents: ["veterinarias"],
      groups: [],
      suggestions: [],
    };
  }

  async ping(): Promise<{ status: string; engine?: string }> {
    if (this.failNextPing) throw new Error("backend caido");
    return { status: "ok", engine: "sqlite" };
  }
}
