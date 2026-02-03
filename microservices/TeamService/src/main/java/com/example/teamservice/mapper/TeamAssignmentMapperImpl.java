package com.example.teamservice.mapper;

import com.example.teamservice.Model.Dto.TeamAssignmentCreateRequest;
import com.example.teamservice.Model.Dto.TeamAssignmentDTO;
import com.example.teamservice.Model.Dto.TeamAssignmentUpdateRequest;
import com.example.teamservice.Model.Entities.TeamAssignment;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TeamAssignmentMapperImpl implements TeamAssignmentMapper {
    @Override
    public TeamAssignmentDTO toDTO(TeamAssignment entity) {
        if (entity == null) return null;
        TeamAssignmentDTO dto = new TeamAssignmentDTO();
        dto.setId(entity.getId());
        dto.setIdeaId(entity.getIdeaId());
        dto.setUserId(entity.getUserId());
        dto.setAssignedById(entity.getAssignedById());
        dto.setAssignmentDate(entity.getAssignmentDate());
        dto.setRole(entity.getRole());
        return dto;
    }

    @Override
    public List<TeamAssignmentDTO> toDTOList(List<TeamAssignment> entities) {
        if (entities == null) return null;
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public TeamAssignment toEntity(TeamAssignmentCreateRequest request) {
        if (request == null) return null;
        TeamAssignment entity = new TeamAssignment();
        entity.setIdeaId(request.getIdeaId());
        entity.setUserId(request.getUserId());
        entity.setAssignedById(request.getAssignedById());
        entity.setAssignmentDate(new Date());
        entity.setRole(request.getRole());
        return entity;
    }

    @Override
    public void updateEntityFromDTO(TeamAssignmentUpdateRequest request, TeamAssignment entity) {
        if (request == null || entity == null) return;
        if (request.getIdeaId() != null) entity.setIdeaId(request.getIdeaId());
        if (request.getUserId() != null) entity.setUserId(request.getUserId());
        if (request.getAssignedById() != null) entity.setAssignedById(request.getAssignedById());
        if (request.getAssignmentDate() != null) entity.setAssignmentDate(request.getAssignmentDate());
        if (request.getRole() != null) entity.setRole(request.getRole());
    }
}
