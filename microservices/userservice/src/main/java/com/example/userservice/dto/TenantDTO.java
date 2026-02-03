package com.example.userservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantDTO {
    private Long id;
    private String name;
    private String tenantType;
    private String createdAt;
}
