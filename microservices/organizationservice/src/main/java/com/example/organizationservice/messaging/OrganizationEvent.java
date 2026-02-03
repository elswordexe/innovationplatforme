package com.example.organizationservice.messaging;

import com.example.organizationservice.enums.OrganizationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationEvent {
    private Long organizationId;
    private String name;
    private OrganizationType organizationType;
    private Long managerId;
    private String type; // ORGANIZATION_CREATED, ORGANIZATION_UPDATED
    private Instant createdAt;
}
