package com.example.ideaservice.Service;

import com.example.ideaservice.Exceptions.ResourceNotFoundException;
import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Model.enums.IdeaStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IdeaService {
    IdeaDTO createIdea(IdeaCreateRequest request, Long creatorId, Long organizationId);

    IdeaDTO createIdeaMultipart(IdeaCreateRequest request,
                               MultipartFile coverImage,
                               List<MultipartFile> attachments,
                               Long creatorId,
                               Long organizationId);
    IdeaDTO getIdeaById(Long id) throws ResourceNotFoundException;

    // Org-scoped global list
    List<IdeaDTO> getAllIdeasByOrg(Long organizationId);

    IdeaDTO updateIdea(Long id, IdeaUpdateRequest request, Long currentUserId, Long organizationId) throws ResourceNotFoundException;
    void deleteIdea(Long id, Long currentUserId, Long organizationId) throws ResourceNotFoundException;
    IdeaDTO submitIdea(Long id) throws ResourceNotFoundException;
    IdeaDTO changeStatus(Long id, IdeaStatus newStatus) throws ResourceNotFoundException;

    // Reads
    List<IdeaDTO> getIdeasByStatusInOrg(IdeaStatus status, Long organizationId);
    List<IdeaDTO> getIdeasByCreator(Long creatorId);
    List<IdeaDTO> getIdeasByCreatorAndOrg(Long creatorId, Long organizationId);
    List<IdeaDTO> getIdeasByOrganization(Long organizationId);
    List<IdeaDTO> searchIdeasInOrg(String keyword, Long organizationId);
    List<IdeaDTO> getTop10IdeasInOrg(Long organizationId);

    IdeaDTO approveBudget(Long id) throws ResourceNotFoundException;
    IdeaDTO rejectBudget(Long id) throws ResourceNotFoundException;
    IdeaDTO addTeamMember(Long ideaId, Long userId) throws ResourceNotFoundException;
    IdeaDTO removeTeamMember(Long ideaId, Long userId) throws ResourceNotFoundException;
    List<Long> getTeamMembers(Long ideaId) throws ResourceNotFoundException;
    void updateVoteCount(Long ideaId, Integer voteCount);
}