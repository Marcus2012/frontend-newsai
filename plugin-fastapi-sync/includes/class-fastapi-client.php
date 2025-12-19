<?php
/**
 * Cliente FastAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class FastAPI_Client {
    
    private $api_url = 'http://localhost:8000';
    private $api_username = 'admin';
    private $api_password = 'admin123';
    private $token = null;
    private $token_expires = 0;
    
    public function __construct( $api_url = null, $username = null, $password = null ) {
        if ( $api_url ) {
            $this->api_url = $api_url;
        } else {
            // En Docker Linux, usar gateway.docker.internal para acceder al host
            $this->api_url = 'http://gateway.docker.internal:8000';
        }
        if ( $username ) {
            $this->api_username = $username;
        }
        if ( $password ) {
            $this->api_password = $password;
        }
    }
    
    /**
     * Obtener token de autenticación
     */
    public function authenticate() {
        $url = $this->api_url . '/auth/login';
        
        $response = wp_remote_post( $url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode( array(
                'username' => $this->api_username,
                'password' => $this->api_password,
            ) ),
            'timeout' => 30,
        ) );
        
        if ( is_wp_error( $response ) ) {
            error_log( 'FastAPI Auth Error: ' . $response->get_error_message() );
            return false;
        }
        
        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        
        if ( isset( $body['access_token'] ) ) {
            $this->token = $body['access_token'];
            $this->token_expires = time() + ( $body['expires_in'] ?? 28800 );
            return true;
        }
        
        error_log( 'FastAPI Auth Failed: ' . print_r( $body, true ) );
        return false;
    }
    
    /**
     * Obtener artículos del FastAPI
     */
    public function get_articles() {
        if ( ! $this->token || time() >= $this->token_expires ) {
            if ( ! $this->authenticate() ) {
                return null;
            }
        }
        
        $url = $this->api_url . '/admin/articles';
        
        $response = wp_remote_get( $url, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->token,
                'Content-Type' => 'application/json',
            ),
            'timeout' => 30,
        ) );
        
        if ( is_wp_error( $response ) ) {
            error_log( 'FastAPI Get Articles Error: ' . $response->get_error_message() );
            return null;
        }
        
        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        
        if ( is_array( $body ) ) {
            return $body;
        }
        
        error_log( 'FastAPI Get Articles Response: ' . print_r( $body, true ) );
        return null;
    }
}
