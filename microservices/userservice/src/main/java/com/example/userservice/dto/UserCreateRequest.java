package com.example.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreateRequest {
    @NotBlank
    private String fullname;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    @Size(min = 6)
    private String password;
    @NotBlank
    private String role;
    
    // Optional profile picture URL or base64 data
    private String profilePicture;

    // New optional onboarding fields
    // Expected values: individual | startup | organization
    private String entityType;

    // Optional tenant name (company/startup) for startup/organization registrations
    private String tenantName;

    // Optional 6-char alphanumeric SSO code to join a tenant
    @Pattern(regexp = "[A-Za-z0-9]{6}", message = "SSO code must be 6 alphanumeric characters")
    private String ssoCode;
}

