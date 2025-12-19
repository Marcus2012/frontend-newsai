<?php
/**
 * Gestor de Sincronización
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class FastAPI_Sync_Manager {
    
    private $fastapi_client;
    private $post_type = 'post';
    private $post_category = 'fastapi-articles';
    
    public function __construct() {
        $this->fastapi_client = new FastAPI_Client();
    }
    
    /**
     * Sincronizar artículos desde FastAPI
     */
    public function sync_articles() {
        $articles = $this->fastapi_client->get_articles();
        
        if ( ! $articles || ! is_array( $articles ) ) {
            error_log( 'FastAPI Sync: No articles found or error occurred' );
            return false;
        }
        
        $synced_count = 0;
        $errors = array();
        
        foreach ( $articles as $article ) {
            $result = $this->sync_article( $article );
            if ( $result ) {
                $synced_count++;
            } else {
                $errors[] = $article['id'] ?? 'unknown';
            }
        }
        
        error_log( "FastAPI Sync Complete: {$synced_count} articles synced. Errors: " . count( $errors ) );
        
        return array(
            'success' => true,
            'synced' => $synced_count,
            'errors' => $errors,
        );
    }
    
    /**
     * Sincronizar un artículo individual
     */
    private function sync_article( $article ) {
        if ( ! isset( $article['id'] ) || ! isset( $article['title'] ) ) {
            error_log( 'FastAPI Sync: Invalid article structure' );
            return false;
        }
        
        // Buscar si el post ya existe
        $existing_post = $this->find_existing_post( $article['id'] );
        
        $post_data = array(
            'post_title'   => $article['title'] ?? 'Sin título',
            'post_content' => $article['description'] ?? '',
            'post_type'    => $this->post_type,
            'post_status'  => ( $article['status'] ?? '' ) === 'published' ? 'publish' : 'draft',
            'post_author'  => 1,
        );
        
        if ( $existing_post ) {
            // Actualizar post existente
            $post_data['ID'] = $existing_post->ID;
            $result = wp_update_post( $post_data, true );
        } else {
            // Crear nuevo post
            $result = wp_insert_post( $post_data, true );
        }
        
        if ( is_wp_error( $result ) ) {
            error_log( 'FastAPI Sync Post Error: ' . $result->get_error_message() );
            return false;
        }
        
        // Guardar metadata de FastAPI
        update_post_meta( $result, '_fastapi_article_id', $article['id'] );
        update_post_meta( $result, '_fastapi_category', $article['category'] ?? '' );
        update_post_meta( $result, '_fastapi_author', $article['author'] ?? '' );
        update_post_meta( $result, '_fastapi_created_at', $article['created_at'] ?? '' );
        
        // Asignar categoría
        $term = term_exists( $this->post_category, 'category' );
        
        if ( ! $term ) {
            $term_result = wp_insert_term( $this->post_category, 'category' );
            if ( ! is_wp_error( $term_result ) && isset( $term_result['term_id'] ) ) {
                wp_set_post_terms( $result, $term_result['term_id'], 'category' );
            }
        } else {
            $term_id = is_array( $term ) ? $term['term_id'] : $term;
            wp_set_post_terms( $result, (int) $term_id, 'category' );
        }
        
        return true;
    }
    
    /**
     * Buscar post existente por ID de FastAPI
     */
    private function find_existing_post( $fastapi_id ) {
        $args = array(
            'post_type'      => $this->post_type,
            'meta_query'     => array(
                array(
                    'key'   => '_fastapi_article_id',
                    'value' => $fastapi_id,
                ),
            ),
            'posts_per_page' => 1,
        );
        
        $query = new WP_Query( $args );
        
        if ( $query->have_posts() ) {
            return $query->posts[0];
        }
        
        return null;
    }
}
