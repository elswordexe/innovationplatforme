package com.example.userservice.dto;

import lombok.Data;

@Data
public class GenerateInviteRequest {
    // Email of the invited member (optional for open invite)
    private String invitedEmail;
    // Single-use by default; if >1 allow multiple redemptions
    private Integer maxUses = 1;
}
