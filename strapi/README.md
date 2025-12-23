# Strapi (Open Source) – Backend para NewsAI

Este directorio contiene el scaffold inicial para un proyecto Strapi (v4, OSS) pensado para gestionar noticias con flujo Draft → Publish.

Objetivos
- Gestionar artículos (borrador/publicado) como en WordPress.
- Proveer API REST (y opcional GraphQL) para que el `frontend` Next.js muestre sólo artículos publicados.

Estructura añadida
- `src/api/article/content-types/article/schema.json` — definición del content-type `Article` con `draftAndPublish` activado.

Quickstart (local)
1. Desde la raíz del proyecto: `cd strapi`
2. Instalar dependencias: `npm install`
3. Ejecutar en modo desarrollo (usa SQLite por defecto): `npm run develop`

Notas
- Accede a la admin UI en `http://localhost:1337/admin` y crea un usuario admin la primera vez.
- Los artículos nuevos se guardan como borrador; publícalos desde la UI para que estén accesibles públicamente.
- Endpoints útiles (REST):
  - Listar publicados: `GET /api/articles?publicationState=live&populate=*`
  - Obtener por id/slug: `GET /api/articles/:id?populate=*`
  - Para obtener borradores (requiere autenticación admin): `GET /api/articles?publicationState=preview&populate=*`

Integración con Next.js (frontend)
- Añade en el frontend la variable de entorno `NEXT_PUBLIC_STRAPI_URL` apuntando a la URL de Strapi (ej: http://localhost:1337 o la URL de producción).
- Ejemplo de fetch para sólo artículos publicados:

```js
const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL;
const res = await fetch(`${STRAPI}/api/articles?publicationState=live&populate=*`);
const json = await res.json();
const articles = json.data.map(item => ({ id: item.id, ...item.attributes }));
```

Aprobación / publicar
- Puedes publicar manualmente desde la Admin UI.
- Si quieres automatizar la aprobación desde el frontend, crea un endpoint protegido en Strapi (plugin o controller) que cambie el estado de publicación de un artículo (requiere autenticación con token admin o un role/account con permisos).

Despliegue
- Strapi puede desplegarse en un servicio que soporte Node (Railway, Render, GCP Cloud Run, Fly, DigitalOcean). Para producción recomienda usar una base de datos externa (Postgres) y almacenar uploads en S3/Cloud Storage.
- Configurar `NEXT_PUBLIC_STRAPI_URL` en Vercel para que el frontend apunte al backend desplegado.

Si quieres, puedo:
- Añadir un controller Strapi para aprobar artículos vía API.
- Crear un `Dockerfile` y `docker-compose` de ejemplo para producción con Postgres.
