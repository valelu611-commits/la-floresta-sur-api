# la-floresta-sur-api

API **REST/JSON pública** de La Floresta Sur (Kennedy, Bogotá). Es la única capa que
se expone a internet: valida datos con Zod, aplica filtros, resuelve CORS, limita
peticiones y habla con el backend interno mediante un puerto (`BackendPort`).

```text
Frontend  ->  [esta API]  ->  la-floresta-sur-backend  ->  PostgreSQL / MySQL / SQLite
```

## Stack

- Node.js 24 + TypeScript (ESM)
- Express 4, Zod, Helmet, CORS, express-rate-limit
- Vitest + Supertest
- Docker + Render

## Inicio rápido

```bash
npm install
cp .env.example .env       # Windows: copy .env.example .env
npm run dev                # http://localhost:3000/api/v1/health
```

Requiere el backend en `http://localhost:4000`:

```bash
# en ../la-floresta-sur-backend
npm run db:migrate && npm run db:seed && npm run dev
```

## Variables de entorno

| Variable | Ejemplo | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto público |
| `BACKEND_URL` | `http://localhost:4000` | URL interna del backend |
| `ADMIN_API_KEY` | `clave-larga` | Debe coincidir con el backend |
| `CORS_ORIGINS` | `https://mi-front.vercel.app` | Orígenes permitidos (`*` en demo) |
| `RATE_LIMIT_MAX` | `600` | Peticiones por IP cada 15 min |

## Endpoints

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/health` | — | Liveness de la API |
| GET | `/api/v1/health` | — | API + backend |
| GET | `/api/v1/categories` | — | 13 categorías con color e icono |
| GET | `/api/v1/stats` | — | Conteos para la portada |
| GET | `/api/v1/search?q=` | — | Búsqueda transversal |
| POST | `/api/v1/agent/ask` | — | Agente de IA (`{ "question": "..." }`) |
| GET | `/api/v1/places` | — | Listado con filtros |
| GET | `/api/v1/places/:id` | — | Detalle |
| POST | `/api/v1/places` | `x-admin-key` | Crear |
| PATCH | `/api/v1/places/:id` | `x-admin-key` | Actualizar |
| DELETE | `/api/v1/places/:id` | `x-admin-key` | Borrar |

Los mismos cinco verbos existen para `security-incidents`, `road-segments`,
`cadastral-properties` y `localities`.

### Ejemplos

```bash
curl "http://localhost:3000/api/v1/places?category=veterinarias&limit=5"

curl -X POST http://localhost:3000/api/v1/places \
  -H "content-type: application/json" \
  -H "x-admin-key: dev-admin-key" \
  -d '{"categorySlug":"comida","name":"Tamaleria","address":"Calle 50 Sur # 87-99","lat":4.6118,"lon":-74.1502}'

curl -X POST http://localhost:3000/api/v1/agent/ask \
  -H "content-type: application/json" \
  -d '{"question":"donde hay veterinarias y camaras"}'
```

Contrato completo: [`docs/api-contract.md`](docs/api-contract.md).

## Pruebas

```bash
npm run verify    # 100 líneas + tipos + 19 pruebas
npm test
```

Las pruebas usan `FakeBackend` (implementación en memoria de `BackendPort`), así que no
necesitan red ni base de datos.

## Documentación

- [Contrato de API](docs/api-contract.md)
- [Arquitectura y UML](docs/architecture.md)
- [Requerimientos](docs/requirements.md)
- [Plan de pruebas](docs/test-plan.md)
- [Despliegue público](docs/deployment.md)

## Reglas

- Cada archivo ≤ **100 líneas** (CI).
- Validación Zod antes de tocar el backend; `strict()` rechaza campos desconocidos.
- Escrituras con `x-admin-key` comparada en tiempo constante.
- Los errores del backend se propagan con su código HTTP original.

## Licencia

MIT.
