package com.example.userservice.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullname;
    private String email;
    private String password;
    private String role;
    
    // Profile picture URL or base64 data
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePicture;

    // User's selected usage type during registration (INDIVIDUAL/STARTUP/ORGANIZATION)
    @Enumerated(EnumType.STRING)
    private TenantType entityType;

    // If the user joined a tenant via SSO/invite, store linkage
    private Long tenantId;

    @Enumerated(EnumType.STRING)
    private TenantType tenantType;
}
