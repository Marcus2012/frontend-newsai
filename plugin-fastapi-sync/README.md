# FastAPI Articles Sync - Plugin de WordPress

Este plugin sincroniza automáticamente los artículos desde un servidor FastAPI a WordPress.

## Instalación

### Opción 1: Copiar al contenedor Docker (Recomendado)

```bash
# Desde la raíz del proyecto
docker cp plugin-fastapi-sync wordpress_wordpress_1:/var/www/html/wp-content/plugins/
```

O si usas docker-compose:

```bash
docker-compose cp plugin-fastapi-sync wordpress:/var/www/html/wp-content/plugins/
```

### Opción 2: Copiar manualmente

1. Copia la carpeta `plugin-fastapi-sync` a `wp-content/plugins/`
2. Accede a WordPress Admin → Plugins
3. Activa "FastAPI Articles Sync"

## Configuración

1. Ve a **Admin Panel → FastAPI Sync**
2. Configura la URL del servidor FastAPI (por defecto: `http://localhost:8000`)
3. Haz clic en **Sincronizar Ahora** para sincronizar los artículos

## Características

- ✓ Autenticación JWT con FastAPI
- ✓ Sincronización automática cada hora
- ✓ Sincronización manual desde el admin
- ✓ Actualización de artículos existentes
- ✓ Almacenamiento de metadatos del FastAPI
- ✓ Gestión automática de categorías
- ✓ Panel de administración intuitivo

## Requisitos

- WordPress 5.0+
- PHP 7.4+
- Acceso a FastAPI en `http://localhost:8000`
- Credenciales: `admin:admin123` (configurable)

## Estructura

```
plugin-fastapi-sync/
├── fastapi-sync.php              # Archivo principal del plugin
├── includes/
│   ├── class-fastapi-client.php  # Cliente para FastAPI
│   ├── class-sync-manager.php    # Gestor de sincronización
│   └── admin-menu.php            # Interfaz de administración
└── README.md
```

## Logs

Los errores y eventos se registran en `wp-content/debug.log` (si WORDPRESS_DEBUG está activado).

## API FastAPI Requerida

El plugin espera que FastAPI tenga los siguientes endpoints:

- **POST** `/auth/login` - Autenticación
- **GET** `/admin/articles` - Listar artículos

Estructura de artículos esperada:

```json
[
  {
    "id": "123",
    "title": "Título del artículo",
    "description": "Contenido del artículo",
    "category": "Deportes",
    "author": "AI System",
    "created_at": "2025-12-14T10:30:00",
    "status": "published"
  }
]
```

## Soporte

Para problemas, revisa los logs en `wp-content/debug.log` o contacta al equipo de desarrollo.
