package com.example.ideaservice.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // CORS is handled by the API Gateway. Keep per-service CORS disabled to avoid duplicate headers.
        return new UrlBasedCorsConfigurationSource();
    }
}
