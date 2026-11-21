# Despliegue público de la API

La API va **después** del backend. Consulta también
`la-floresta-sur-backend/docs/deployment.md` para el orden completo.

## 1. Render (recomendado, gratis)

1. <https://dashboard.render.com> → **New** → **Web Service**.
2. Conecta `valelu611-commits/la-floresta-sur-api`.
3. Runtime **Node**, plan **Free**, región **Oregon**.
4. Build: `npm ci && npm run build` · Start: `npm start` · Health: `/health`.
5. Variables:

   | Clave | Valor |
   | --- | --- |
   | `BACKEND_URL` | `https://<backend>.onrender.com` |
   | `ADMIN_API_KEY` | la misma del backend |
   | `CORS_ORIGINS` | `https://<frontend>.vercel.app` o `*` |
   | `RATE_LIMIT_MAX` | `600` |

6. Deploy y verifica:

   ```bash
   curl https://<api>.onrender.com/health
   curl https://<api>.onrender.com/api/v1/health
   curl https://<api>.onrender.com/api/v1/stats
   ```

## 2. Docker

```bash
docker build -t floresta-api .
docker run -p 3000:3000 \
  -e BACKEND_URL=http://host.docker.internal:4000 \
  -e ADMIN_API_KEY=dev-admin-key \
  floresta-api
```

O `docker compose up --build` (el backend debe estar corriendo en el host).

## 3. Prueba de escritura en producción

```bash
curl -X POST https://<api>.onrender.com/api/v1/places \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{"categorySlug":"cai","name":"CAI de prueba","address":"Calle 50 Sur # 86-40","lat":4.6116,"lon":-74.1528}'
```

Debe responder `201`. Sin la clave, `401`.

## 4. Checklist

- [ ] `/health` responde `ok`.
- [ ] `/api/v1/health` muestra `upstream.status = ok`.
- [ ] `/api/v1/stats` devuelve 13 categorías.
- [ ] `/api/v1/search?q=parque` devuelve hits.
- [ ] `POST` con clave → `201`; sin clave → `401`.
- [ ] CORS permite el dominio del frontend (revisa la consola del navegador).
- [ ] Logs de Render sin errores 502 repetidos.

## 5. Problemas típicos

| Síntoma | Causa | Solución |
| --- | --- | --- |
| 502 `upstream_error` | Backend dormido (plan free) | Reintentar; el primer request tarda ~30 s |
| 401 en escrituras | Claves distintas | Igualar `ADMIN_API_KEY` en ambos servicios |
| CORS bloqueado | `CORS_ORIGINS` sin el dominio | Agregar la URL exacta de Vercel |
| 429 | Rate limit | Subir `RATE_LIMIT_MAX` o esperar 15 min |
