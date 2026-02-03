package com.example.userservice.service;

import com.example.userservice.dto.TenantCreateRequest;
import com.example.userservice.dto.TenantDTO;

public interface TenantService {
    TenantDTO createTenant(TenantCreateRequest request, Long createdByUserId);
}
