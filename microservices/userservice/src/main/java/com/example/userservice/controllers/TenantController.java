package com.example.userservice.controllers;

import com.example.userservice.dto.TenantCreateRequest;
import com.example.userservice.dto.TenantDTO;
import com.example.userservice.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Créer des tenants (organisation / startup)")
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    @Operation(summary = "Créer un tenant (organisation/startup)")
    public ResponseEntity<TenantDTO> createTenant(@Valid @RequestBody TenantCreateRequest req,
                                                  @AuthenticationPrincipal Object user) {
        Long userId = null;
        if (user != null) {
            try {
                // If authentication principal provides an id, extract reflectively (best-effort)
                java.lang.reflect.Method m = user.getClass().getMethod("getId");
                Object id = m.invoke(user);
                if (id instanceof Number) userId = ((Number) id).longValue();
            } catch (Exception ignored) {}
        }
        TenantDTO created = tenantService.createTenant(req, userId);
        return ResponseEntity.ok(created);
    }
}
