<?php
/**
 * Menú de Administración
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'admin_menu', 'fastapi_sync_add_admin_menu' );
function fastapi_sync_add_admin_menu() {
    add_menu_page(
        'FastAPI Sync',
        'FastAPI Sync',
        'manage_options',
        'fastapi-sync',
        'fastapi_sync_admin_page',
        'dashicons-database-import',
        25
    );
}

// Procesar sincronización antes de que se envíe output
add_action( 'admin_init', 'fastapi_sync_handle_sync' );
function fastapi_sync_handle_sync() {
    if ( ! isset( $_POST['sync_now'] ) ) {
        return;
    }
    
    if ( ! check_admin_referer( 'fastapi_sync_nonce' ) ) {
        return;
    }
    
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }
    
    $sync_manager = new FastAPI_Sync_Manager();
    $result = $sync_manager->sync_articles();
    
    if ( $result && isset( $result['success'] ) && $result['success'] ) {
        wp_redirect( admin_url( 'admin.php?page=fastapi-sync&sync=success' ) );
    } else {
        wp_redirect( admin_url( 'admin.php?page=fastapi-sync&sync=error' ) );
    }
    exit;
}

/**
 * Página de administración
 */
function fastapi_sync_admin_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'No tienes permiso para acceder a esta página.' );
    }
    
    ?>
    <div class="wrap">
        <h1>FastAPI Articles Sync</h1>
        
        <div class="card">
            <h2>Configuración y Sincronización</h2>
            <p>Sincroniza artículos desde el servidor FastAPI a tu base de datos de WordPress.</p>
            
            <form method="post" action="">
                <?php wp_nonce_field( 'fastapi_sync_nonce' ); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="api_url">URL del API FastAPI:</label></th>
                        <td>
                            <input 
                                type="text" 
                                id="api_url" 
                                name="api_url" 
                                value="<?php echo esc_attr( get_option( 'fastapi_sync_url', 'http://localhost:8000' ) ); ?>" 
                                class="regular-text"
                            />
                            <p class="description">Ej: http://localhost:8000</p>
                        </td>
                    </tr>
                </table>
                
                <p>
                    <button type="submit" name="sync_now" class="button button-primary">
                        🔄 Sincronizar Ahora
                    </button>
                </p>
            </form>
        </div>
        
        <div class="card">
            <h2>Información</h2>
            <ul>
                <li><strong>Versión del Plugin:</strong> <?php echo esc_html( FASTAPI_SYNC_VERSION ); ?></li>
                <li><strong>Estado:</strong> <span style="color: green;">✓ Activo</span></li>
                <li><strong>Artículos sincronizados:</strong> <?php echo wp_count_posts( 'post' )->publish ?? 0; ?></li>
            </ul>
        </div>
        
        <div class="card">
            <h2>Artículos Recientes</h2>
            <?php
            $recent_posts = new WP_Query( array(
                'post_type'      => 'post',
                'posts_per_page' => 5,
                'meta_query'     => array(
                    array(
                        'key' => '_fastapi_article_id',
                        'compare' => 'EXISTS',
                    ),
                ),
            ) );
            
            if ( $recent_posts->have_posts() ) {
                echo '<table class="wp-list-table widefat fixed">';
                echo '<thead><tr><th>Título</th><th>Categoría</th><th>Estado</th><th>Fecha</th></tr></thead>';
                echo '<tbody>';
                
                while ( $recent_posts->have_posts() ) {
                    $recent_posts->the_post();
                    $category = get_post_meta( get_the_ID(), '_fastapi_category', true );
                    echo '<tr>';
                    echo '<td><strong>' . esc_html( get_the_title() ) . '</strong></td>';
                    echo '<td>' . esc_html( $category ) . '</td>';
                    echo '<td>' . esc_html( get_post_status() ) . '</td>';
                    echo '<td>' . esc_html( get_the_date( 'Y-m-d H:i' ) ) . '</td>';
                    echo '</tr>';
                }
                
                echo '</tbody>';
                echo '</table>';
            } else {
                echo '<p>No hay artículos sincronizados aún.</p>';
            }
            ?>
        </div>
    </div>
    <?php
}
