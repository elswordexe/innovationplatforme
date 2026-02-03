package com.example.userservice.dto;

import lombok.Data;

@Data
public class RedeemRequest {
    // Provide either ssoCode or inviteToken
    private String ssoCode;
    private String inviteToken;
    // Email of the user redeeming (for validation/notification)
    private String email;
}
