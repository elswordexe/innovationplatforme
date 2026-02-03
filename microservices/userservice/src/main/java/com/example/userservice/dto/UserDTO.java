package com.example.userservice.dto;

import com.example.userservice.entities.TenantType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String fullname;
    private String email;
    private String role;
    private String profilePicture;

    // Onboarding-related context
    private TenantType entityType;
    private Long tenantId;
    private TenantType tenantType;
    private String tenantName;
}

