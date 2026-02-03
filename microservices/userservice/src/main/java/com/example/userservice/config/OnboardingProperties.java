package com.example.userservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "onboarding")
@Getter
@Setter
public class OnboardingProperties {
    private int expiryDays = 30;
    // UI expects 6-char SSO codes by default
    private int codeLength = 6;
    /** Base URL for invite redemption links, e.g., https://app.example.com/join */
    private String inviteBaseUrl = "http://localhost:4200/join";
}