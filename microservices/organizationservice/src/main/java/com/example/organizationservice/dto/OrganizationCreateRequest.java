package com.example.organizationservice.dto;

import com.example.organizationservice.enums.OrganizationType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationCreateRequest {
    
    @NotBlank(message = "Le nom est obligatoire")
    private String name;
    
    @NotNull(message = "Le type d'organisation est obligatoire")
    private OrganizationType type;
    
    private Long managerId;
}
