package com.example.userservice.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "invitations", indexes = {
        @Index(name = "idx_invite_token", columnList = "token", unique = true),
        @Index(name = "idx_invite_tenant", columnList = "tenantId,tenantType")
})
@Getter
@Setter
@NoArgsConstructor
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;

    @Enumerated(EnumType.STRING)
    private TenantType tenantType;

    @Column(nullable = false, unique = true, length = 120)
    private String token; // opaque invite token

    private Instant createdAt = Instant.now();

    private Instant expiresAt;

    @Column(nullable = false)
    private Integer maxUses = 1; // default single-use invite

    @Column(nullable = false)
    private Integer usedCount = 0;

    @Enumerated(EnumType.STRING)
    private InvitationStatus status = InvitationStatus.PENDING;

    private Long createdByUserId;

    private String invitedEmail; // optional, can be null for open invites
}
