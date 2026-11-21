# Contrato de API v1

Base: `https://<api>.onrender.com/api/v1` · Formato: JSON UTF-8.
Escrituras requieren `x-admin-key`. Errores usan `{ "error": { "code", "message", "details?" } }`.

## Convenciones de listado

```json
{
  "data": [ { "id": "uuid", "name": "..." } ],
  "meta": { "total": 35, "limit": 20, "offset": 0 }
}
```

| Parámetro | Tipo | Reglas |
| --- | --- | --- |
| `q` | string | 1–120 caracteres |
| `limit` | int | 1–100 (por defecto 20) |
| `offset` | int | ≥ 0 (por defecto 0) |
| `bbox` | string | `minLon,minLat,maxLon,maxLat` |

## Recursos y filtros específicos

| Recurso | Filtros extra | Campos obligatorios al crear |
| --- | --- | --- |
| `places` | `category` | `categorySlug`, `name`, `address`, `lat`, `lon` |
| `security-incidents` | `kind`, `severity`, `from`, `to` | `title`, `kind`, `occurredAt`, `placeHint`, `lat`, `lon`, `severity` |
| `road-segments` | `condition`, `status` | `name`, `condition`, `status`, `lengthM`, `lat`, `lon` |
| `cadastral-properties` | `stratum`, `landUse`, `upz` | `address`, `stratum`, `landUse`, `areaM2`, `cadastralRef`, `lat`, `lon` |
| `localities` | `code` | `name`, `code`, `population`, `areaHa`, `lat`, `lon` |

`category` ∈ `librerias, cai, camaras, comida, veterinarias, zonas-verdes, transporte, deportes, educacion`.

## Ejemplos de respuesta

### `GET /api/v1/stats`

```json
{
  "barrio": "La Floresta Sur",
  "center": { "lat": 4.6112, "lon": -74.1508 },
  "totalRecords": 75,
  "categories": [
    { "slug": "veterinarias", "name": "Veterinarias", "color": "#10B981", "icon": "paw", "resource": "places", "count": 4 }
  ]
}
```

### `GET /api/v1/search?q=parque`

```json
{
  "query": "parque",
  "total": 3,
  "hits": [
    {
      "id": "uuid",
      "resource": "places",
      "title": "Parque La Floresta Sur",
      "subtitle": "Calle 50 Sur entre Carrera 86 y 88",
      "categorySlug": "zonas-verdes",
      "lat": 4.6113,
      "lon": -74.151
    }
  ],
  "countsByCategory": { "zonas-verdes": 3 }
}
```

### `POST /api/v1/agent/ask`

```json
{
  "question": "hay robos y camaras cerca",
  "answer": "**Camaras de seguridad** (4 registros)...",
  "generatedBy": "rules",
  "intents": ["camaras", "seguridad"],
  "groups": [
    { "slug": "camaras", "name": "Camaras de seguridad", "color": "#64748B", "items": [] }
  ],
  "suggestions": ["¿Qué transporte público pasa por La Floresta Sur?"]
}
```

## Crear / actualizar

```http
POST /api/v1/places
x-admin-key: <clave>
content-type: application/json

{ "categorySlug": "cai", "name": "CAI de prueba", "address": "Calle 50 Sur # 86-40",
  "lat": 4.6116, "lon": -74.1528 }
```

- `201` con `{ "data": {...} }`.
- `PATCH` acepta subconjunto de campos y devuelve `200`.
- `DELETE` devuelve `204` sin cuerpo.
- Campos desconocidos → `400` (`strict`).
- `lat`/`lon` fuera de Bogotá → `400` con `details[].field`.

## Códigos

| HTTP | `code` | Cuándo |
| --- | --- | --- |
| 400 | `validation_error` | Zod o reglas de negocio |
| 401 | `unauthorized` | Falta/incorrecta `x-admin-key` |
| 404 | `not_found` | Recurso o ruta inexistente |
| 429 | `too_many_requests` | Límite de peticiones |
| 502 | `upstream_error` | Backend caído o timeout |
| 503 | `degraded` | `/api/v1/health` sin backend |
