package com.example.bookmarkservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // CORS handled by API Gateway. Avoid registering per-service CORS to prevent duplicate headers.
        return new UrlBasedCorsConfigurationSource();
    }
}
