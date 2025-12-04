package com.example.gateway.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springdoc.core.models.GroupedOpenApi;

@Configuration
public class OpenApiConfig {

    @Bean
    public GroupedOpenApi usersApi() {
        return GroupedOpenApi.builder()
                .group("users")
                .pathsToMatch("/users/**")
                .build();
    }

    @Bean
    public GroupedOpenApi ideasApi() {
        return GroupedOpenApi.builder()
                .group("ideas")
                .pathsToMatch("/ideas/**")
                .build();
    }

    @Bean
    public GroupedOpenApi votesApi() {
        return GroupedOpenApi.builder()
                .group("votes")
                .pathsToMatch("/votes/**")
                .build();
    }

    @Bean
    public GroupedOpenApi workflowApi() {
        return GroupedOpenApi.builder()
                .group("workflow")
                .pathsToMatch("/workflow/**")
                .build();
    }

    @Bean
    public GroupedOpenApi teamApi() {
        return GroupedOpenApi.builder()
                .group("teams")
                .pathsToMatch("/teams/**")
                .build();
    }

    @Bean
    public GroupedOpenApi notificationApi() {
        return GroupedOpenApi.builder()
                .group("notifications")
                .pathsToMatch("/notifications/**")
                .build();
    }
}
