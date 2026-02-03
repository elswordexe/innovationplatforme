package com.example.teamservice.Service;

import com.example.teamservice.Exceptions.ResourceNotFoundException;
import com.example.teamservice.Model.Dto.TeamAssignmentCreateRequest;
import com.example.teamservice.Model.Dto.TeamAssignmentDTO;
import com.example.teamservice.Model.Dto.TeamAssignmentUpdateRequest;

import java.util.List;

public interface TeamAssignmentService {
    TeamAssignmentDTO create(TeamAssignmentCreateRequest request);
    TeamAssignmentDTO getById(Long id) throws ResourceNotFoundException;
    List<TeamAssignmentDTO> getAll();
    List<TeamAssignmentDTO> getByIdeaId(Long ideaId);
    List<TeamAssignmentDTO> getByUserId(Long userId);
    TeamAssignmentDTO update(Long id, TeamAssignmentUpdateRequest request) throws ResourceNotFoundException;
    void delete(Long id) throws ResourceNotFoundException;
}
