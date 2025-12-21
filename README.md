# Headless WordPress + GraphQL + Next.js

## Stack
- WordPress 6.6 (PHP 8.2) with WPGraphQL plugin (manual install via wp-cli)
- MySQL 8
- Next.js (TypeScript) + Apollo Client

## Requisitos previos
- Docker y Docker Compose
- Node.js 18+ y npm

## Puesta en marcha
1) Copia variables y ajusta credenciales si quieres:
   ```bash
   cp .env.example .env
   ```
2) Levanta WordPress y MySQL:
   ```bash
   docker compose up -d
   ```
3) Completa la instalación de WordPress en http://localhost:8080 y crea un usuario admin.
4) Instala WPGraphQL dentro del contenedor (una vez WP esté inicializado):
   ```bash
   docker compose exec wordpress wp plugin install wp-graphql --activate
   ```
   (Opcional) instala CORS o JWT según tus necesidades.
5) Verifica el endpoint GraphQL: http://localhost:8080/graphql

## Frontend (Next.js)
1) Variables:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   # Apunta al backend en Cloud Run
   export NEXT_PUBLIC_API_ENDPOINT=https://newsai-backend-855091632688.us-east4.run.app
   # Ajusta NEXT_PUBLIC_GRAPHQL_ENDPOINT si no usas localhost:8080
   ```
2) Instala dependencias y arranca dev:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Luego abre http://localhost:3000. La página de ejemplo hace una query simple al endpoint GraphQL.

### Optimización y herramientas añadidas

- Tailwind CSS: se añadió configuración base (`tailwind.config.js`, `postcss.config.js`) y `styles/globals.css`. Instala dependencias en el frontend:

```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- SSG / ISR: la página principal ahora usa `getStaticProps` con `revalidate` para listar artículos rápidamente y mejorar SEO. Ajusta `NEXT_PUBLIC_STRAPI_URL` o `NEXT_PUBLIC_API_ENDPOINT` en `frontend/.env.local`.

- `next/image`: las páginas usan `next/image` para optimizar imágenes. Añade dominios permitidos en `next.config.js` si usas imágenes externas.

## Comandos útiles
- Detener stack: `docker compose down`
- Ver logs: `docker compose logs -f`
- Acceder a WP-CLI: `docker compose run --rm wp-cli wp plugin list`
- Resetear datos (borra BD): `docker compose down -v`

## Notas
- El volumen `wp_data` persiste plugins y uploads.
- Ajusta credenciales y dominios en `.env` / `.env.local` antes de producción.
 
## Ingesta de noticias externas (webhook)

Si tu backend de noticias puede hacer push, configura un webhook hacia Strapi para centralizar aprobación y publicación.

- Añade en el entorno de Strapi la variable: `STRAPI_SYNC_SECRET=valor_secreto`.
- Endpoint en Strapi (dev): `POST {STRAPI_URL}/api/articles/import`.
- Payload esperado (ejemplo):

```json
{
   "items": [
      {
         "id": "external-123",
         "title": "Titular",
         "content": "Cuerpo...",
         "excerpt": "Resumen",
         "author": "Autor",
         "publishedAt": "2025-12-20T12:00:00Z",
         "source_url": "https://..."
      }
   ]
}
```

- Strapi valida header `x-sync-secret` (o `sync_secret` en body) contra `STRAPI_SYNC_SECRET` y realiza upsert usando `external_id`.
- El campo `external_id` se usa para evitar duplicados.

Si tu backend no puede push, considera habilitar un cron dentro de Strapi que llame al endpoint externo y use la misma lógica de upsert.
 - Ajusta credenciales y dominios en `.env` / `.env.local` antes de producción.
