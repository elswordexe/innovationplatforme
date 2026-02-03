package com.example.userservice.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantCreateRequest {
    @NotBlank
    private String name;

    // expected values: individual | startup | organization
    @NotBlank
    private String tenantType;
}
