package com.example.userservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SsoCodeResponse {
    private String code;
    private String expiresAt; // ISO-8601
    private Integer maxUses;
    private Integer usedCount;
}
