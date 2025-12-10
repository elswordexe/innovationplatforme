package com.example.teamservice.Service;

import com.example.teamservice.Exceptions.ResourceNotFoundException;
import com.example.teamservice.Model.Dto.TeamAssignmentCreateRequest;
import com.example.teamservice.Model.Dto.TeamAssignmentDTO;
import com.example.teamservice.Model.Dto.TeamAssignmentUpdateRequest;
import com.example.teamservice.Model.Entities.TeamAssignment;
import com.example.teamservice.Repository.TeamAssignmentRepository;
import com.example.teamservice.mapper.TeamAssignmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamAssignmentServiceImpl implements TeamAssignmentService {

    private final TeamAssignmentRepository repository;
    private final TeamAssignmentMapper mapper;

    @Override
    public TeamAssignmentDTO create(TeamAssignmentCreateRequest request) {
        TeamAssignment toSave = mapper.toEntity(request);
        TeamAssignment saved = repository.save(toSave);
        return mapper.toDTO(saved);
    }

    @Override
    public TeamAssignmentDTO getById(Long id) throws ResourceNotFoundException {
        TeamAssignment entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team assignment not found with id: " + id));
        return mapper.toDTO(entity);
    }

    @Override
    public List<TeamAssignmentDTO> getAll() {
        return mapper.toDTOList(repository.findAll());
    }

    @Override
    public List<TeamAssignmentDTO> getByIdeaId(Long ideaId) {
        return mapper.toDTOList(repository.findByIdeaId(ideaId));
    }

    @Override
    public List<TeamAssignmentDTO> getByUserId(Long userId) {
        return mapper.toDTOList(repository.findByUserId(userId));
    }

    @Override
    public TeamAssignmentDTO update(Long id, TeamAssignmentUpdateRequest request) throws ResourceNotFoundException {
        TeamAssignment existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team assignment not found with id: " + id));
        mapper.updateEntityFromDTO(request, existing);
        TeamAssignment saved = repository.save(existing);
        return mapper.toDTO(saved);
    }

    @Override
    public void delete(Long id) throws ResourceNotFoundException {
        TeamAssignment existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team assignment not found with id: " + id));
        repository.delete(existing);
    }
}
