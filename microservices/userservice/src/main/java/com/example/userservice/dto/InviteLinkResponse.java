package com.example.userservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InviteLinkResponse {
    private String inviteToken;
    private String inviteLink;
    private String expiresAt;
    private Integer maxUses;
    private Integer usedCount;
}
