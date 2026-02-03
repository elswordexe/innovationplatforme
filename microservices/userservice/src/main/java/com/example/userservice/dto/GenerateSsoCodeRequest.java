package com.example.userservice.dto;

import lombok.Data;

@Data
public class GenerateSsoCodeRequest {
    // Optional friendly prefix derived from org/startup abbreviation, e.g., "ACME"
    private String prefix;
    // 0 = unlimited uses, otherwise max number of members that can redeem
    private Integer maxUses = 0;
    // Optional manager email to send the code/link to
    private String managerEmail;
}
