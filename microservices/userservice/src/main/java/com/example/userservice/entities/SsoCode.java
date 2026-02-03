package com.example.userservice.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "sso_codes", indexes = {
        @Index(name = "idx_sso_code_code", columnList = "code", unique = true),
        @Index(name = "idx_sso_code_tenant", columnList = "tenantId,tenantType")
})
@Getter
@Setter
@NoArgsConstructor
public class SsoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;

    @Enumerated(EnumType.STRING)
    private TenantType tenantType;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    private Instant createdAt = Instant.now();

    private Instant expiresAt;

    @Column(nullable = false)
    private Integer maxUses = 0; // 0 = unlimited

    @Column(nullable = false)
    private Integer usedCount = 0;

    @Enumerated(EnumType.STRING)
    private InvitationStatus status = InvitationStatus.PENDING;

    private Long createdByUserId;
}
