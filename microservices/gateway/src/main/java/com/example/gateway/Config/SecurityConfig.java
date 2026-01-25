package com.example.gateway.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${application.security.jwt.secret-key:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKey;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers(
                        "/v3/api-docs/**",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/actuator/**",
                        "/api/auth/**"
                ).permitAll()
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(customizer -> customizer.jwtDecoder(jwtDecoder())));

        return http.build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        var keyBytes = java.util.Base64.getDecoder().decode(secretKey);
        var secret = new SecretKeySpec(keyBytes, "HmacSHA256");
        return NimbusReactiveJwtDecoder.withSecretKey(secret).build();
    }

    @Bean
    public GlobalFilter propagateUserHeadersFilter() {
        return (exchange, chain) -> exchange.getPrincipal()
            .cast(AbstractAuthenticationToken.class)
            .flatMap(auth -> {
                Object principal = auth.getPrincipal();
                if (principal instanceof Jwt jwt) {
                    String username = jwt.getSubject();
                    Object userId = jwt.getClaims().get("userId");
                    Object role = jwt.getClaims().get("role");
                    var mutated = exchange.getRequest().mutate()
                            .header("X-User-Name", username != null ? username : "")
                            .headers(h -> {
                                if (userId != null) h.set("X-User-Id", String.valueOf(userId));
                                if (role != null) h.set("X-User-Role", String.valueOf(role));
                            })
                            .build();
                    return chain.filter(exchange.mutate().request(mutated).build());
                }
                return chain.filter(exchange);
            })
            .switchIfEmpty(chain.filter(exchange));
    }
}
