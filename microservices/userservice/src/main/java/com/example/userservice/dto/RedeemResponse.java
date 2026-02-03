package com.example.userservice.dto;

import com.example.userservice.entities.TenantType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RedeemResponse {
    private TenantType tenantType;
    private Long tenantId;
    private String status; // e.g., "JOINED" or more detailed info
}
