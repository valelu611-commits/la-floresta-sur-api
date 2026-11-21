# Requerimientos de la capa API

## Funcionales

| ID | Requerimiento | Implementación |
| --- | --- | --- |
| RF-A1 | Exponer las 13 categorías y sus conteos | `GET /categories`, `GET /stats` |
| RF-A2 | CRUD REST de 5 recursos | `routes/crud-router.ts` + `routes/resources.ts` |
| RF-A3 | Validar cuerpos antes de escribir | Zod `strict()` en `schemas/` |
| RF-A4 | Filtros geográficos y temáticos | Paso transparente validado de `q`, `bbox`, `category`, etc. |
| RF-A5 | Búsqueda transversal | `GET /search` (mínimo 2 caracteres) |
| RF-A6 | Agente en lenguaje natural | `POST /agent/ask` |
| RF-A7 | Proteger escrituras | `x-admin-key` en tiempo constante |
| RF-A8 | Errores homogéneos | `error.code` + `message` + `details` |

## No funcionales

| ID | Requerimiento | Verificación |
| --- | --- | --- |
| RNF-A1 | ≤ 100 líneas por archivo | `npm run check:size` (CI) |
| RNF-A2 | SOLID: rutas dependen de `BackendPort` | `tests/helpers/fake-backend.ts` |
| RNF-A3 | Disponibilidad pública | Render + `render.yaml` |
| RNF-A4 | Seguridad HTTP | Helmet, CORS, rate limit, body 100 kB |
| RNF-A5 | Rendimiento | Validación O(1), sin agregaciones locales |
| RNF-A6 | Observabilidad | `/health` y `/api/v1/health` con estado del backend |
| RNF-A7 | Compatibilidad | JSON estándar, CORS configurable |

## Reglas de validación destacadas

- `categorySlug` debe ser una de las 9 categorías de lugares.
- `lat` ∈ [4.45, 4.84], `lon` ∈ [-74.25, -74.00].
- `stratum` ∈ [1, 6]; `severity` ∈ {baja, media, alta}.
- `occurredAt` con formato `YYYY-MM-DD`.
- `bbox` con 4 números separados por coma.
- `limit` ≤ 100, `offset` ≥ 0.
