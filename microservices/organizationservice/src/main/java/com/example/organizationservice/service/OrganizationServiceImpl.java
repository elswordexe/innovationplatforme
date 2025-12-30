package com.example.organizationservice.service;

import com.example.organizationservice.dto.OrganizationCreateRequest;
import com.example.organizationservice.dto.OrganizationDTO;
import com.example.organizationservice.entities.Organization;
import com.example.organizationservice.exception.ResourceNotFoundException;
import com.example.organizationservice.mapper.OrganizationMapper;
import com.example.organizationservice.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMapper organizationMapper;

    @Override
    public OrganizationDTO createOrganization(OrganizationCreateRequest request) {
        if (organizationRepository.existsByName(request.getName())) {
            throw new RuntimeException("Organization with name " + request.getName() + " already exists");
        }
        Organization organization = organizationMapper.toEntity(request);
        Organization saved = organizationRepository.save(organization);
        return organizationMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationDTO getOrganizationById(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
        return organizationMapper.toDTO(organization);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationDTO> getAllOrganizations() {
        return organizationMapper.toDTOList(organizationRepository.findAll());
    }

    @Override
    public OrganizationDTO updateOrganization(Long id, OrganizationCreateRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
        
        organizationMapper.updateEntityFromDTO(request, organization);
        Organization saved = organizationRepository.save(organization);
        return organizationMapper.toDTO(saved);
    }

    @Override
    public void deleteOrganization(Long id) {
        if (!organizationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Organization not found with id: " + id);
        }
        organizationRepository.deleteById(id);
    }
}
