package com.example.organizationservice.mapper;

import com.example.organizationservice.dto.OrganizationCreateRequest;
import com.example.organizationservice.dto.OrganizationDTO;
import com.example.organizationservice.entities.Organization;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-01T00:14:04+0100",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.15 (Microsoft)"
)
@Component
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public OrganizationDTO toDTO(Organization organization) {
        if ( organization == null ) {
            return null;
        }

        OrganizationDTO.OrganizationDTOBuilder organizationDTO = OrganizationDTO.builder();

        organizationDTO.id( organization.getId() );
        organizationDTO.name( organization.getName() );
        organizationDTO.type( organization.getType() );
        organizationDTO.managerId( organization.getManagerId() );

        return organizationDTO.build();
    }

    @Override
    public List<OrganizationDTO> toDTOList(List<Organization> organizations) {
        if ( organizations == null ) {
            return null;
        }

        List<OrganizationDTO> list = new ArrayList<OrganizationDTO>( organizations.size() );
        for ( Organization organization : organizations ) {
            list.add( toDTO( organization ) );
        }

        return list;
    }

    @Override
    public Organization toEntity(OrganizationCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Organization.OrganizationBuilder organization = Organization.builder();

        organization.name( request.getName() );
        organization.type( request.getType() );
        organization.managerId( request.getManagerId() );

        return organization.build();
    }

    @Override
    public void updateEntityFromDTO(OrganizationCreateRequest request, Organization organization) {
        if ( request == null ) {
            return;
        }

        organization.setName( request.getName() );
        organization.setType( request.getType() );
        organization.setManagerId( request.getManagerId() );
    }
}
