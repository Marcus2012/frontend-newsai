<?php
/**
 * Plugin Name: FastAPI Articles Sync
 * Plugin URI: http://localhost:8080
 * Description: Sincroniza artículos desde FastAPI al sistema de posts de WordPress
 * Version: 1.0.0
 * Author: News AI
 * Author URI: http://localhost:8080
 * License: GPL v2 or later
 * Text Domain: fastapi-sync
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

define( 'FASTAPI_SYNC_VERSION', '1.0.0' );
define( 'FASTAPI_SYNC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'FASTAPI_SYNC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Include required files
require_once FASTAPI_SYNC_PLUGIN_DIR . 'includes/class-fastapi-client.php';
require_once FASTAPI_SYNC_PLUGIN_DIR . 'includes/class-sync-manager.php';
require_once FASTAPI_SYNC_PLUGIN_DIR . 'includes/admin-menu.php';

// Hook para sincronización automática (cada hora)
add_action( 'wp_scheduled_event', 'fastapi_sync_articles_scheduled' );

/**
 * Función para sincronizar artículos programadamente
 */
function fastapi_sync_articles_scheduled() {
    $sync_manager = new FastAPI_Sync_Manager();
    $sync_manager->sync_articles();
}

/**
 * Activación del plugin
 */
register_activation_hook( __FILE__, 'fastapi_sync_activate' );
function fastapi_sync_activate() {
    // Crear tabla personalizada si es necesaria
    // Programar evento si es necesario
    if ( ! wp_next_scheduled( 'wp_scheduled_event' ) ) {
        wp_schedule_event( time(), 'hourly', 'wp_scheduled_event' );
    }
}

/**
 * Desactivación del plugin
 */
register_deactivation_hook( __FILE__, 'fastapi_sync_deactivate' );
function fastapi_sync_deactivate() {
    wp_clear_scheduled_hook( 'wp_scheduled_event' );
}

// Admin notices
add_action( 'admin_notices', 'fastapi_sync_admin_notices' );
function fastapi_sync_admin_notices() {
    if ( isset( $_GET['page'] ) && $_GET['page'] === 'fastapi-sync' ) {
        if ( isset( $_GET['sync'] ) && $_GET['sync'] === 'success' ) {
            echo '<div class="notice notice-success is-dismissible"><p>✓ Artículos sincronizados correctamente.</p></div>';
        } elseif ( isset( $_GET['sync'] ) && $_GET['sync'] === 'error' ) {
            echo '<div class="notice notice-error is-dismissible"><p>✗ Error al sincronizar los artículos.</p></div>';
        }
    }
}
