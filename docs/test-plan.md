# Plan y modelo de pruebas de la API

## Estrategia

- **Unitarias de contrato:** esquemas Zod mediante peticiones HTTP.
- **Integración de rutas:** Supertest + `FakeBackend` (sin red).
- **Humo real:** API contra backend SQLite sembrado (`localhost:4000`).

## Casos

| ID | Caso | Esperado | Archivo |
| --- | --- | --- | --- |
| A-01 | GET `/places?limit=5&offset=2` | 200, `meta` correcta | `places.test.ts` |
| A-02 | GET `/places` sin query | `limit=20`, `offset=0` | idem |
| A-03 | GET `/places?limit=500` | 400 | idem |
| A-04 | GET con `category` inválida | 400 | idem |
| A-05 | GET con `bbox` incompleto | 400 | idem |
| A-06 | GET id inexistente | 404 `not_found` | idem |
| A-07 | POST sin clave / clave errónea | 401 | idem |
| A-08 | POST válido | 201 + `data.id` | idem |
| A-09 | POST con `lat=40.4` | 400 y `field=lat` | idem |
| A-10 | POST con campo extra | 400 (`strict`) | idem |
| A-11 | PATCH parcial | 200 con cambio | idem |
| A-12 | DELETE | 204 y backend recibe id | idem |
| A-13 | GET `/health` | 200 | `system.test.ts` |
| A-14 | GET `/api/v1/health` con backend caído | 503 `degraded` | idem |
| A-15 | GET categorías y stats | 200 con datos | idem |
| A-16 | GET `/search` sin `q` | 400 | idem |
| A-17 | POST `/agent/ask` vacío | 400 | idem |
| A-18 | POST `/agent/ask` válido | 200 con `answer` | idem |
| A-19 | Ruta desconocida | 404 JSON | idem |
| A-20 | POST incidente válido | 201 | `resources.test.ts` |
| A-21 | Severidad inválida | 400 | idem |
| A-22 | POST vía y predio válidos | 201 | idem |
| A-23 | Estrato 9 / localidad incompleta | 400 | idem |
| A-24 | Listados filtrados de 4 recursos | 200 | idem |

## Ejecución

```bash
npm test               # 19 pruebas, ~2 s
npm run verify         # + tamaño + tipos
```

## Pruebas manuales con backend real

```bash
# 1. backend sembrado en :4000
# 2. api en :3000
curl localhost:3000/api/v1/health
curl "localhost:3000/api/v1/places?category=veterinarias"
curl -X POST localhost:3000/api/v1/agent/ask \
  -H "content-type: application/json" \
  -d '{"question":"que transporte pasa por el barrio"}'
```

## Criterios de aceptación

- 100 % de las pruebas en verde en CI.
- Ninguna escritura permitida sin `x-admin-key`.
- Contrato documentado en `docs/api-contract.md` sin divergencias.
