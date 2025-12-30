package com.example.organizationservice.mapper;

import com.example.organizationservice.dto.OrganizationCreateRequest;
import com.example.organizationservice.dto.OrganizationDTO;
import com.example.organizationservice.entities.Organization;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {
    OrganizationDTO toDTO(Organization organization);
    List<OrganizationDTO> toDTOList(List<Organization> organizations);
    Organization toEntity(OrganizationCreateRequest request);
    void updateEntityFromDTO(OrganizationCreateRequest request, @MappingTarget Organization organization);
}
