package com.example.teamservice.mapper;

import com.example.teamservice.Model.Dto.TeamAssignmentCreateRequest;
import com.example.teamservice.Model.Dto.TeamAssignmentDTO;
import com.example.teamservice.Model.Dto.TeamAssignmentUpdateRequest;
import com.example.teamservice.Model.Entities.TeamAssignment;

import java.util.List;

public interface TeamAssignmentMapper {
    TeamAssignmentDTO toDTO(TeamAssignment entity);
    List<TeamAssignmentDTO> toDTOList(List<TeamAssignment> entities);
    TeamAssignment toEntity(TeamAssignmentCreateRequest request);
    void updateEntityFromDTO(TeamAssignmentUpdateRequest request, TeamAssignment entity);
}
