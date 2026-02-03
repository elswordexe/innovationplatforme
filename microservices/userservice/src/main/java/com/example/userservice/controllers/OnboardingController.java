package com.example.userservice.controllers;

import com.example.userservice.dto.*;
import com.example.userservice.entities.TenantType;
import com.example.userservice.security.CustomUserDetails;
import com.example.userservice.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding", description = "Génération et rédemption des codes SSO et liens d'invitation")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/{tenantType}/{tenantId}/sso")
    @Operation(summary = "Générer un code SSO pour un tenant (Organisation/Startup)")
    public ResponseEntity<SsoCodeResponse> generateSso(
            @PathVariable("tenantType") String tenantTypeStr,
            @PathVariable("tenantId") Long tenantId,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody GenerateSsoCodeRequest req
    ) {
        TenantType tenantType = parseTenantType(tenantTypeStr);
        Long userId = (user != null) ? user.getId() : null;
        return ResponseEntity.ok(onboardingService.generateSsoCode(tenantId, tenantType, userId, req));
    }

    @PostMapping("/{tenantType}/{tenantId}/invites")
    @Operation(summary = "Générer un lien d'invitation pour un tenant (Organisation/Startup)")
    public ResponseEntity<InviteLinkResponse> generateInvite(
            @PathVariable("tenantType") String tenantTypeStr,
            @PathVariable("tenantId") Long tenantId,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody GenerateInviteRequest req
    ) {
        TenantType tenantType = parseTenantType(tenantTypeStr);
        Long userId = (user != null) ? user.getId() : null;
        return ResponseEntity.ok(onboardingService.generateInvite(tenantId, tenantType, userId, req));
    }

    @PostMapping("/redeem")
    @Operation(summary = "Racheter (redeem) un code SSO ou un lien d'invitation")
    public ResponseEntity<RedeemResponse> redeem(@RequestBody RedeemRequest req) {
        return ResponseEntity.ok(onboardingService.redeem(req));
    }

    @PostMapping("/sso/create")
    @Operation(summary = "Sauvegarder un code SSO généré localement")
    public ResponseEntity<SsoCodeResponse> createLocalSsoCode(
            @RequestParam String code,
            @RequestParam String tenantType
    ) {
        TenantType type = parseTenantType(tenantType);
        return ResponseEntity.ok(onboardingService.saveSsoCode(code, type));
    }

    @GetMapping("/sso/verify/{code}")
    @Operation(summary = "Vérifier si un code SSO existe et est valide")
    public ResponseEntity<Boolean> verifySsoCode(@PathVariable String code) {
        return ResponseEntity.ok(onboardingService.verifySsoCode(code));
    }

    private TenantType parseTenantType(String value) {
        String v = value == null ? "" : value.trim().toUpperCase();
        switch (v) {
            case "ORG":
            case "ORGANIZATION":
                return TenantType.ORGANIZATION;
            case "STARTUP":
                return TenantType.STARTUP;
            case "INDIVIDUAL":
            case "USER":
                return TenantType.INDIVIDUAL;
            default:
                throw new IllegalArgumentException("Unknown tenantType: " + value);
        }
    }
}
