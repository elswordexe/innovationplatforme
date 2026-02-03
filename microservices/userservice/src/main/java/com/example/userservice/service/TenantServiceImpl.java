package com.example.userservice.service;

import com.example.userservice.dto.TenantCreateRequest;
import com.example.userservice.dto.TenantDTO;
import com.example.userservice.entities.Tenant;
import com.example.userservice.entities.TenantType;
import com.example.userservice.repositories.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;

    @Override
    public TenantDTO createTenant(TenantCreateRequest request, Long createdByUserId) {
        Tenant t = Tenant.builder()
                .name(request.getName())
                .tenantType(parseTenantType(request.getTenantType()))
                .createdAt(Instant.now())
                .build();

        Tenant saved = tenantRepository.save(t);

        return TenantDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .tenantType(saved.getTenantType().name())
                .createdAt(saved.getCreatedAt().toString())
                .build();
    }

    private TenantType parseTenantType(String value) {
        String v = value == null ? "" : value.trim().toUpperCase();
        switch (v) {
            case "ORG":
            case "ORGANIZATION":
                return TenantType.ORGANIZATION;
            case "STARTUP":
                return TenantType.STARTUP;
            default:
                return TenantType.INDIVIDUAL;
        }
    }
}
