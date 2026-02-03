package com.example.userservice.service;

import com.example.userservice.dto.*;
import com.example.userservice.entities.TenantType;

public interface OnboardingService {
    SsoCodeResponse generateSsoCode(Long tenantId, TenantType tenantType, Long createdByUserId, GenerateSsoCodeRequest req);
    InviteLinkResponse generateInvite(Long tenantId, TenantType tenantType, Long createdByUserId, GenerateInviteRequest req);
    RedeemResponse redeem(RedeemRequest request);
    SsoCodeResponse saveSsoCode(String code, TenantType tenantType);
    boolean verifySsoCode(String code);
}
