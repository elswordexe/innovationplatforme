package com.example.userservice.repositories;

import com.example.userservice.entities.SsoCode;
import com.example.userservice.entities.TenantType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface SsoCodeRepository extends JpaRepository<SsoCode, Long> {
    Optional<SsoCode> findByCode(String code);
    long countByTenantIdAndTenantTypeAndExpiresAtAfter(Long tenantId, TenantType tenantType, Instant now);
}
