package com.example.organizationservice.service;

import com.example.organizationservice.dto.OrganizationCreateRequest;
import com.example.organizationservice.dto.OrganizationDTO;

import java.util.List;

public interface OrganizationService {
    OrganizationDTO createOrganization(OrganizationCreateRequest request);
    OrganizationDTO getOrganizationById(Long id);
    List<OrganizationDTO> getAllOrganizations();
    OrganizationDTO updateOrganization(Long id, OrganizationCreateRequest request);
    void deleteOrganization(Long id);
}
