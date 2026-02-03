package com.example.userservice.service;

import com.example.userservice.config.OnboardingProperties;
import com.example.userservice.dto.*;
import com.example.userservice.entities.Invitation;
import com.example.userservice.entities.InvitationStatus;
import com.example.userservice.entities.SsoCode;
import com.example.userservice.entities.TenantType;
import com.example.userservice.repositories.InvitationRepository;
import com.example.userservice.repositories.SsoCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OnboardingServiceImpl implements OnboardingService {

    private final SsoCodeRepository ssoCodeRepository;
    private final InvitationRepository invitationRepository;
    private final CodeGenerator codeGenerator;
    private final OnboardingProperties properties;
    private final EmailSender emailSender;

    @Override
    @Transactional
    public SsoCodeResponse generateSsoCode(Long tenantId, TenantType tenantType, Long createdByUserId, GenerateSsoCodeRequest req) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.getExpiryDays(), ChronoUnit.DAYS);

        String code = codeGenerator.generateCode(req.getPrefix(), properties.getCodeLength());

        SsoCode sso = new SsoCode();
        sso.setTenantId(tenantId);
        sso.setTenantType(tenantType);
        sso.setCode(code);
        sso.setCreatedByUserId(createdByUserId);
        sso.setExpiresAt(expiresAt);
        sso.setMaxUses(req.getMaxUses() == null ? 0 : Math.max(0, req.getMaxUses()));
        sso.setUsedCount(0);
        sso.setStatus(InvitationStatus.PENDING);

        sso = ssoCodeRepository.save(sso);

        if (req.getManagerEmail() != null && !req.getManagerEmail().isBlank()) {
            String subject = "Votre code SSO";
            String body = "Code SSO: " + code + "\nExpiration: " + expiresAt.toString();
            emailSender.send(req.getManagerEmail(), subject, body);
        }

        return SsoCodeResponse.builder()
                .code(sso.getCode())
                .expiresAt(sso.getExpiresAt() == null ? null : sso.getExpiresAt().toString())
                .maxUses(sso.getMaxUses())
                .usedCount(sso.getUsedCount())
                .build();
    }

    @Override
    @Transactional
    public InviteLinkResponse generateInvite(Long tenantId, TenantType tenantType, Long createdByUserId, GenerateInviteRequest req) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.getExpiryDays(), ChronoUnit.DAYS);
        String token = UUID.randomUUID().toString().replace("-", "");

        Invitation inv = new Invitation();
        inv.setTenantId(tenantId);
        inv.setTenantType(tenantType);
        inv.setToken(token);
        inv.setCreatedByUserId(createdByUserId);
        inv.setExpiresAt(expiresAt);
        inv.setMaxUses(req.getMaxUses() == null ? 1 : Math.max(1, req.getMaxUses()));
        inv.setUsedCount(0);
        inv.setStatus(InvitationStatus.PENDING);
        inv.setInvitedEmail(req.getInvitedEmail());

        inv = invitationRepository.save(inv);

        String link = properties.getInviteBaseUrl() + "?token=" + token;

        if (req.getInvitedEmail() != null && !req.getInvitedEmail().isBlank()) {
            String subject = "Invitation à rejoindre";
            String body = "Utilisez ce lien pour rejoindre: " + link + "\nExpiration: " + expiresAt.toString();
            emailSender.send(req.getInvitedEmail(), subject, body);
        }

        return InviteLinkResponse.builder()
                .inviteToken(inv.getToken())
                .inviteLink(link)
                .expiresAt(inv.getExpiresAt() == null ? null : inv.getExpiresAt().toString())
                .maxUses(inv.getMaxUses())
                .usedCount(inv.getUsedCount())
                .build();
    }

    @Override
    @Transactional
    public RedeemResponse redeem(RedeemRequest request) {
        if (request.getInviteToken() != null && !request.getInviteToken().isBlank()) {
            return redeemInvite(request);
        }
        if (request.getSsoCode() != null && !request.getSsoCode().isBlank()) {
            return redeemSso(request);
        }
        throw new IllegalArgumentException("ssoCode or inviteToken required");
    }

    private RedeemResponse redeemSso(RedeemRequest request) {
        String code = request.getSsoCode();
        Optional<SsoCode> opt = ssoCodeRepository.findByCode(code);
        SsoCode sso = opt.orElseThrow(() -> new IllegalArgumentException("Invalid SSO code"));

        Instant now = Instant.now();
        if (sso.getExpiresAt() != null && now.isAfter(sso.getExpiresAt())) {
            sso.setStatus(InvitationStatus.EXPIRED);
            ssoCodeRepository.save(sso);
            throw new IllegalStateException("SSO code expired");
        }
        if (sso.getMaxUses() != null && sso.getMaxUses() > 0 && sso.getUsedCount() >= sso.getMaxUses()) {
            sso.setStatus(InvitationStatus.REDEEMED);
            ssoCodeRepository.save(sso);
            throw new IllegalStateException("SSO code already fully used");
        }

        // consumed once for this redemption
        sso.setUsedCount(sso.getUsedCount() + 1);
        if (sso.getMaxUses() != null && sso.getMaxUses() > 0 && sso.getUsedCount() >= sso.getMaxUses()) {
            sso.setStatus(InvitationStatus.REDEEMED);
        }
        ssoCodeRepository.save(sso);

        return RedeemResponse.builder()
                .tenantType(sso.getTenantType())
                .tenantId(sso.getTenantId())
                .status("JOINED")
                .build();
    }

    @Override
    @Transactional
    public SsoCodeResponse saveSsoCode(String code, TenantType tenantType) {
        // Check if code already exists
        if (ssoCodeRepository.findByCode(code).isPresent()) {
            throw new IllegalArgumentException("SSO code already exists");
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.getExpiryDays(), ChronoUnit.DAYS);

        SsoCode sso = new SsoCode();
        sso.setTenantId(null); // No tenant yet - will be assigned on first redeem
        sso.setTenantType(tenantType);
        sso.setCode(code);
        sso.setCreatedByUserId(null); // Generated by user, not by admin
        sso.setExpiresAt(expiresAt);
        sso.setMaxUses(0); // Unlimited uses
        sso.setUsedCount(0);
        sso.setStatus(InvitationStatus.PENDING);

        sso = ssoCodeRepository.save(sso);

        return SsoCodeResponse.builder()
                .code(sso.getCode())
                .expiresAt(sso.getExpiresAt() == null ? null : sso.getExpiresAt().toString())
                .maxUses(sso.getMaxUses())
                .usedCount(sso.getUsedCount())
                .build();
    }

    @Override
    public boolean verifySsoCode(String code) {
        Optional<SsoCode> ssoOpt = ssoCodeRepository.findByCode(code);
        if (ssoOpt.isEmpty()) {
            return false;
        }

        SsoCode sso = ssoOpt.get();
        Instant now = Instant.now();

        // Check if expired
        if (sso.getExpiresAt() != null && now.isAfter(sso.getExpiresAt())) {
            return false;
        }

        // Check if max uses reached
        if (sso.getMaxUses() != null && sso.getMaxUses() > 0 && sso.getUsedCount() >= sso.getMaxUses()) {
            return false;
        }

        return true;
    }

    private RedeemResponse redeemInvite(RedeemRequest request) {
        String token = request.getInviteToken();
        Invitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite token"));

        Instant now = Instant.now();
        if (inv.getExpiresAt() != null && now.isAfter(inv.getExpiresAt())) {
            inv.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(inv);
            throw new IllegalStateException("Invite expired");
        }
        if (inv.getInvitedEmail() != null && !inv.getInvitedEmail().isBlank()) {
            if (request.getEmail() == null || !inv.getInvitedEmail().equalsIgnoreCase(request.getEmail())) {
                throw new IllegalStateException("Invite email mismatch");
            }
        }
        if (inv.getMaxUses() != null && inv.getMaxUses() > 0 && inv.getUsedCount() >= inv.getMaxUses()) {
            inv.setStatus(InvitationStatus.REDEEMED);
            invitationRepository.save(inv);
            throw new IllegalStateException("Invite already used");
        }

        inv.setUsedCount(inv.getUsedCount() + 1);
        if (inv.getMaxUses() != null && inv.getMaxUses() > 0 && inv.getUsedCount() >= inv.getMaxUses()) {
            inv.setStatus(InvitationStatus.REDEEMED);
        }
        invitationRepository.save(inv);

        return RedeemResponse.builder()
                .tenantType(inv.getTenantType())
                .tenantId(inv.getTenantId())
                .status("JOINED")
                .build();
    }
}
