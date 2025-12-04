package com.example.ideaservice.Service;

import com.example.ideaservice.Exceptions.ResourceNotFoundException;
import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Model.enums.IdeaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IdeaService {
    IdeaDTO createIdea(IdeaCreateRequest request, Long creatorId);
    IdeaDTO getIdeaById(Long id) throws ResourceNotFoundException;
    List<IdeaDTO> getAllIdeas();
    IdeaDTO updateIdea(Long id, IdeaUpdateRequest request) throws ResourceNotFoundException;
    void deleteIdea(Long id) throws ResourceNotFoundException;
    IdeaDTO submitIdea(Long id) throws ResourceNotFoundException;
    IdeaDTO changeStatus(Long id, IdeaStatus newStatus) throws ResourceNotFoundException;
    List<IdeaDTO> getIdeasByStatus(IdeaStatus status);
    List<IdeaDTO> getIdeasByCreator(Long creatorId);
    List<IdeaDTO> getIdeasByOrganization(Long organizationId);
    List<IdeaDTO> searchIdeas(String keyword);
    List<IdeaDTO> getTop10Ideas();
    IdeaDTO approveBudget(Long id) throws ResourceNotFoundException;
    IdeaDTO rejectBudget(Long id) throws ResourceNotFoundException;
    IdeaDTO addTeamMember(Long ideaId, Long userId) throws ResourceNotFoundException;
    IdeaDTO removeTeamMember(Long ideaId, Long userId) throws ResourceNotFoundException;
    List<Long> getTeamMembers(Long ideaId) throws ResourceNotFoundException;
}