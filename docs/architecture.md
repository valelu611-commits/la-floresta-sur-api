# Arquitectura de la API

## 1. Capas dentro del repositorio

```text
rutas (Express)  ->  schemas (Zod)  ->  BackendPort  ->  HttpBackendClient  ->  backend
```

- **Rutas:** solo orquestan; no saben de SQL ni de URLs del backend.
- **Schemas:** validan y normalizan (SRP).
- **BackendPort:** interfaz (DIP); las pruebas inyectan `FakeBackend`.
- **HttpBackendClient:** traduce errores y normaliza `{ items }` a `{ data, meta }`.

## 2. Diagrama de componentes

```mermaid
graph LR
  FE[Frontend] -->|HTTPS + JSON| MW[Helmet · CORS · RateLimit]
  MW --> R[routes/system · routes/resources]
  R --> SC[schemas Zod]
  R --> BP[BackendPort]
  BP --> HC[HttpBackendClient]
  HC -->|HTTP + x-admin-key| BE[la-floresta-sur-backend]
  BP -.->|tests| FB[FakeBackend]
```

## 3. Diagrama de secuencia: POST /places

```mermaid
sequenceDiagram
  actor A as Admin
  participant R as Ruta Express
  participant G as requireAdmin
  participant Z as Zod
  participant B as BackendPort
  participant BE as Backend

  A->>R: POST /api/v1/places + x-admin-key
  R->>G: valida clave (timingSafeEqual)
  alt clave invalida
    G-->>A: 401 unauthorized
  else clave valida
    G->>Z: validateBody(placeCreateSchema)
    alt body invalido
      Z-->>A: 400 validation_error + details
    else body valido
      Z->>B: create("places", body)
      B->>BE: POST /internal/places
      BE-->>B: 201 { data }
      B-->>A: 201 { data }
    end
  end
```

## 4. Diagrama de clases

```mermaid
classDiagram
  class BackendPort {
    <<interface>>
    +list(resource, query) ListResult
    +get(resource, id) Entity
    +create(resource, input) Entity
    +update(resource, id, patch) Entity
    +remove(resource, id) void
    +search(q, limit) Entity
    +ask(question) AgentAnswer
    +ping() Health
  }
  class HttpBackendClient {
    -baseUrl string
    -adminKey string
    +list()
    +create()
    +ask()
  }
  class FakeBackend {
    +created
    +removed
  }
  class CrudRouter {
    +registerCrudRoutes(app, backend, adminKey, config)
  }
  BackendPort <|.. HttpBackendClient
  BackendPort <|.. FakeBackend
  CrudRouter --> BackendPort
```

## 5. Decisiones

| Decisión | Motivo |
| --- | --- |
| API separada del backend | El backend no se expone; la API controla validación y CORS |
| Zod `strict()` | Evita mass assignment y campos inesperados |
| `x-admin-key` + `timingSafeEqual` | Suficiente para demo pública, sin usuarios |
| `FakeBackend` en pruebas | Pruebas rápidas y deterministas (DIP) |
| Rate limit 600/15 min | Protege el plan gratuito del backend |
| 502 para fallos del backend | Diferencia caída interna de error del cliente |

## 6. Despliegue

```mermaid
graph LR
  V[Vercel · Frontend] --> R[Render · API]
  R --> B[Render · Backend]
  B --> DB[(Neon PostgreSQL)]
```
