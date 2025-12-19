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
   export NEXT_PUBLIC_API_ENDPOINT=https://newsai-backend-855091632688.us-central1.run.app
   # Ajusta NEXT_PUBLIC_GRAPHQL_ENDPOINT si no usas localhost:8080
   ```
2) Instala dependencias y arranca dev:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Luego abre http://localhost:3000. La página de ejemplo hace una query simple al endpoint GraphQL.

## Comandos útiles
- Detener stack: `docker compose down`
- Ver logs: `docker compose logs -f`
- Acceder a WP-CLI: `docker compose run --rm wp-cli wp plugin list`
- Resetear datos (borra BD): `docker compose down -v`

## Notas
- El volumen `wp_data` persiste plugins y uploads.
- Ajusta credenciales y dominios en `.env` / `.env.local` antes de producción.
