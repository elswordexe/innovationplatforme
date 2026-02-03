package com.example.ideaservice.Service;

import com.example.ideaservice.Exceptions.ResourceNotFoundException;
import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Model.Dto.AttachmentUploadRequest;
import com.example.ideaservice.Model.entities.Idea;
import com.example.ideaservice.Model.entities.Attachment;

import com.example.ideaservice.Model.enums.IdeaStatus;
import com.example.ideaservice.Repository.IdeaRepository;
import com.example.ideaservice.Repository.AttachementRepository;
import com.example.ideaservice.mapper.IdeaMapper;
import com.example.ideaservice.messaging.NotificationEvent;
import com.example.ideaservice.messaging.NotificationPublisher;
import com.example.ideaservice.client.UsersClient;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Base64;
import java.util.Date;
import feign.FeignException;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class IdeaServiceImpl implements IdeaService {

    private final IdeaRepository ideaRepository;
    private final AttachementRepository attachementRepository;
    private final IdeaMapper ideaMapper;
    private final NotificationPublisher notificationPublisher;
    private final UsersClient usersClient;
    private final FileStorageService fileStorageService;

    @Override
    public IdeaDTO createIdea(IdeaCreateRequest request, Long creatorId, Long organizationId) {
        log.info("Creating new idea with title: {} for creator: {} in org: {}", request.getTitle(), creatorId, organizationId);

        Idea idea = ideaMapper.toEntity(request);
        idea.setCreatorId(creatorId);
        idea.setOrganizationId(organizationId);

        Idea savedIdea = ideaRepository.save(idea);
        log.info("Idea created successfully with id: {}", savedIdea.getId());

        // Cover image stored as an Attachment with bytes in DB
        if (request.getImageBase64() != null && !request.getImageBase64().isBlank()) {
            try {
                String base64Data = request.getImageBase64();
                if (base64Data.startsWith("data:image/")) {
                    base64Data = base64Data.split(",")[1];
                }
                byte[] imageBytes = Base64.getDecoder().decode(base64Data);

                Attachment attachment = Attachment.builder()
                        .fileName("idea_image_" + savedIdea.getId() + ".jpg")
                        .fileType("image/jpeg")
                        .data(imageBytes)
                        .fileSize((long) imageBytes.length)
                        .uploadDate(new Date())
                        .uploadedBy(creatorId)
                        .idea(savedIdea)
                        .build();

                Attachment savedAtt = attachementRepository.save(attachment);
                savedAtt.setFileUrl("/api/ideas/attachments/" + savedAtt.getId() + "/download");
                attachementRepository.save(savedAtt);
            } catch (Exception e) {
                log.warn("Failed to process image attachment: {}", e.getMessage());
            }
        }

        // Additional attachments stored in DB
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            for (AttachmentUploadRequest a : request.getAttachments()) {
                if (a == null || a.getDataBase64() == null || a.getDataBase64().isBlank()) continue;
                try {
                    String base64Data = a.getDataBase64();
                    int comma = base64Data.indexOf(',');
                    if (comma >= 0) {
                        base64Data = base64Data.substring(comma + 1);
                    }
                    byte[] bytes = Base64.getDecoder().decode(base64Data);

                    Attachment attachment = Attachment.builder()
                            .fileName(a.getFileName() == null ? "attachment" : a.getFileName())
                            .fileType(a.getFileType() == null ? "application/octet-stream" : a.getFileType())
                            .data(bytes)
                            .fileSize((long) bytes.length)
                            .uploadDate(new Date())
                            .uploadedBy(creatorId)
                            .idea(savedIdea)
                            .build();

                    Attachment savedAtt = attachementRepository.save(attachment);
                    savedAtt.setFileUrl("/api/ideas/attachments/" + savedAtt.getId() + "/download");
                    attachementRepository.save(savedAtt);
                } catch (Exception e) {
                    log.warn("Failed to process attachment {}: {}", a.getFileName(), e.getMessage());
                }
            }
        }

        NotificationEvent event = NotificationEvent.builder()
                .userId(creatorId)
                .type("IDEA_CREATED")
                .title("Nouvelle idée créée")
                .message("Votre idée '" + savedIdea.getTitle() + "' a été créée avec l'ID " + savedIdea.getId())
                .createdAt(java.time.Instant.now())
                .build();
        notificationPublisher.publish(event);

        return ideaMapper.toDTO(savedIdea);
    }

    @Override
    @Transactional
    public IdeaDTO getIdeaById(Long id) throws ResourceNotFoundException {
        log.info("Fetching idea with id: {}", id);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        return ideaMapper.toDTO(idea);
    }

    @Override
    public IdeaDTO createIdeaMultipart(IdeaCreateRequest request,
                                      MultipartFile coverImage,
                                      List<MultipartFile> attachments,
                                      Long creatorId,
                                      Long organizationId) {
        log.info("Creating new idea (multipart) with title: {} for creator: {} in org: {}", request.getTitle(), creatorId, organizationId);

        Idea idea = ideaMapper.toEntity(request);
        idea.setCreatorId(creatorId);
        idea.setOrganizationId(organizationId);

        Idea savedIdea = ideaRepository.save(idea);
        log.info("Idea created successfully (multipart) with id: {}", savedIdea.getId());

        if (coverImage != null && !coverImage.isEmpty()) {
            try {
                FileStorageService.StoredFile stored = fileStorageService.storeIdeaFile(savedIdea.getId(), coverImage, "cover");
                Attachment attachment = Attachment.builder()
                        .fileName(coverImage.getOriginalFilename() == null ? "cover" : coverImage.getOriginalFilename())
                        .fileType(coverImage.getContentType() == null ? "application/octet-stream" : coverImage.getContentType())
                        .fileSize(coverImage.getSize())
                        .uploadDate(new Date())
                        .uploadedBy(creatorId)
                        .idea(savedIdea)
                        .filePath(stored.absolutePath())
                        .build();

                Attachment savedAtt = attachementRepository.save(attachment);
                savedAtt.setFileUrl("/api/ideas/attachments/" + savedAtt.getId() + "/download");
                attachementRepository.save(savedAtt);
            } catch (Exception e) {
                log.warn("Failed to store cover image: {}", e.getMessage());
            }
        }

        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile f : attachments) {
                if (f == null || f.isEmpty()) continue;
                try {
                    FileStorageService.StoredFile stored = fileStorageService.storeIdeaFile(savedIdea.getId(), f, "attachments");
                    Attachment attachment = Attachment.builder()
                            .fileName(f.getOriginalFilename() == null ? "attachment" : f.getOriginalFilename())
                            .fileType(f.getContentType() == null ? "application/octet-stream" : f.getContentType())
                            .fileSize(f.getSize())
                            .uploadDate(new Date())
                            .uploadedBy(creatorId)
                            .idea(savedIdea)
                            .filePath(stored.absolutePath())
                            .build();
                    Attachment savedAtt = attachementRepository.save(attachment);
                    savedAtt.setFileUrl("/api/ideas/attachments/" + savedAtt.getId() + "/download");
                    attachementRepository.save(savedAtt);
                } catch (Exception e) {
                    log.warn("Failed to store attachment {}: {}", f.getOriginalFilename(), e.getMessage());
                }
            }
        }

        NotificationEvent event = NotificationEvent.builder()
                .userId(creatorId)
                .type("IDEA_CREATED")
                .title("Nouvelle idée créée")
                .message("Votre idée '" + savedIdea.getTitle() + "' a été créée avec l'ID " + savedIdea.getId())
                .createdAt(java.time.Instant.now())
                .build();
        notificationPublisher.publish(event);

        return ideaMapper.toDTO(savedIdea);
    }

    @Override
    @Transactional
    public List<IdeaDTO> getAllIdeasByOrg(Long organizationId) {
        List<Idea> ideas = ideaRepository.findByOrganizationId(organizationId);
        return ideaMapper.toDTOList(ideas);
    }

    @Override
    public IdeaDTO updateIdea(Long id, IdeaUpdateRequest request, Long currentUserId, Long organizationId) throws ResourceNotFoundException {
        log.info("Updating idea with id: {} by user {} in org {}", id, currentUserId, organizationId);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        if (!idea.getCreatorId().equals(currentUserId) || !idea.getOrganizationId().equals(organizationId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "You can only update your own ideas in the current organization");
        }

        if (idea.getStatus() != IdeaStatus.DRAFT) {
            throw new BadRequestException("Only ideas in DRAFT status can be modified");
        }
        if (request.getTitle() != null) {
            idea.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            idea.setDescription(request.getDescription());
        }

        Idea updatedIdea = ideaRepository.save(idea);
        log.info("Idea updated successfully with id: {}", updatedIdea.getId());

        return ideaMapper.toDTO(updatedIdea);
    }

    @Override
    public void deleteIdea(Long id, Long currentUserId, Long organizationId) throws ResourceNotFoundException {
        log.info("Deleting idea with id: {} by user {} in org {}", id, currentUserId, organizationId);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        if (!idea.getCreatorId().equals(currentUserId) || !idea.getOrganizationId().equals(organizationId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "You can only delete your own ideas in the current organization");
        }

        if (idea.getStatus() != IdeaStatus.DRAFT) {
            throw new BadRequestException("Only ideas in DRAFT status can be deleted");
        }

        ideaRepository.delete(idea);
        log.info("Idea deleted successfully with id: {}", id);
    }
    @Override
    public IdeaDTO submitIdea(Long id) throws ResourceNotFoundException {
        log.info("Submitting idea with id: {}", id);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        if (!idea.canBeSubmitted()) {
            throw new BadRequestException("Idea cannot be submitted. Check title and description.");
        }

        idea.setStatus(IdeaStatus.SUBMITTED);
        Idea updatedIdea = ideaRepository.save(idea);

        log.info("Idea submitted successfully with id: {}", id);

        return ideaMapper.toDTO(updatedIdea);
    }

    @Override
    public IdeaDTO changeStatus(Long id, IdeaStatus newStatus) throws ResourceNotFoundException {
        log.info("Changing status of idea {} to {}", id, newStatus);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));
        validateStatusTransition(idea.getStatus(), newStatus);

        idea.setStatus(newStatus);
        Idea updatedIdea = ideaRepository.save(idea);

        log.info("Status changed successfully for idea {}", id);

        return ideaMapper.toDTO(updatedIdea);
    }

    @Override
    @Transactional
    public List<IdeaDTO> getIdeasByStatusInOrg(IdeaStatus status, Long organizationId) {
        log.info("Fetching ideas with status: {} in org {}", status, organizationId);

        List<Idea> ideas = ideaRepository.findByStatusAndOrganizationId(status, organizationId);
        return ideaMapper.toDTOList(ideas);
    }

    @Override
    @Transactional
    public List<IdeaDTO> getIdeasByCreator(Long creatorId) {
        log.info("Fetching ideas created by user: {} (all orgs)", creatorId);
        List<Idea> ideas = ideaRepository.findByCreatorId(creatorId);
        return ideaMapper.toDTOList(ideas);
    }

    @Override
    @Transactional
    public List<IdeaDTO> getIdeasByOrganization(Long organizationId) {
        log.info("Fetching ideas for organization: {}", organizationId);
        List<Idea> ideas = ideaRepository.findByOrganizationId(organizationId);
        return ideaMapper.toDTOList(ideas);
    }

    @Override
    @Transactional
    public List<IdeaDTO> getIdeasByCreatorAndOrg(Long creatorId, Long organizationId) {
        log.info("Fetching ideas created by user: {} in org {}", creatorId, organizationId);
        List<Idea> ideas = ideaRepository.findByCreatorIdAndOrganizationId(creatorId, organizationId);
        return ideaMapper.toDTOList(ideas);
    }

    @Override
    @Transactional
    public List<IdeaDTO> searchIdeasInOrg(String keyword, Long organizationId) {
        log.info("Searching ideas with keyword: {} in org {}", keyword, organizationId);
        List<Idea> ideas = ideaRepository.searchByKeywordInOrg(keyword, organizationId);
        return ideaMapper.toDTOList(ideas);
    }

    @Override
    @Transactional
    public List<IdeaDTO> getTop10IdeasInOrg(Long organizationId) {
        log.info("Fetching top 10 ideas in org {}", organizationId);
        Pageable topTen = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "totalScore"));
        Page<Idea> topIdeas = ideaRepository.findTopIdeasInOrg(organizationId, topTen);
        return topIdeas.getContent().stream()
                .map(ideaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public IdeaDTO approveBudget(Long id) throws ResourceNotFoundException {
        log.info("Approving budget for idea: {}", id);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        if (idea.getStatus() != IdeaStatus.APPROVED && idea.getStatus() != IdeaStatus.UNDER_REVIEW) {
            throw new BadRequestException("Budget can only be approved for ideas that are APPROVED or UNDER_REVIEW");
        }

        idea.approveBudget();
        Idea updatedIdea = ideaRepository.save(idea);

        log.info("Budget approved for idea: {}", id);


        return ideaMapper.toDTO(updatedIdea);
    }

    @Override
    public IdeaDTO rejectBudget(Long id) throws ResourceNotFoundException {
        log.info("Rejecting budget for idea: {}", id);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        idea.rejectBudget();
        Idea updatedIdea = ideaRepository.save(idea);

        log.info("Budget rejected for idea: {}", id);

        return ideaMapper.toDTO(updatedIdea);
    }

    @Override
    public IdeaDTO addTeamMember(Long ideaId, Long userId) throws ResourceNotFoundException {
        log.info("Adding user {} to idea {} team", userId, ideaId);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + ideaId));

        if (!idea.canAssignTeam()) {
            throw new BadRequestException("Team can only be assigned to APPROVED or ASSIGNING_TEAM status ideas");
        }

        if (idea.isTeamMember(userId)) {
            throw new BadRequestException("User is already a team member");
        }

        // Validate user existence via Users service
        try {
            usersClient.getById(userId);
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        } catch (FeignException e) {
            log.error("Users service error while validating user {}: status={} content={} ", userId, e.status(), e.contentUTF8());
            throw new BadRequestException("Unable to validate user at the moment");
        }

        idea.addTeamMember(userId);
        if (idea.getStatus() == IdeaStatus.APPROVED) {
            idea.setStatus(IdeaStatus.ASSIGNING_TEAM);
        }

        Idea updatedIdea = ideaRepository.save(idea);

        log.info("User {} added to idea {} team", userId, ideaId);

        return ideaMapper.toDTO(updatedIdea);
    }

    @Override
    public IdeaDTO removeTeamMember(Long ideaId, Long userId) throws ResourceNotFoundException {
        log.info("Removing user {} from idea {} team", userId, ideaId);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + ideaId));

        if (!idea.isTeamMember(userId)) {
            throw new BadRequestException("User is not a team member");
        }

        idea.removeTeamMember(userId);
        Idea updatedIdea = ideaRepository.save(idea);

        log.info("User {} removed from idea {} team", userId, ideaId);

        return ideaMapper.toDTO(updatedIdea);
    }

    @Override
    @Transactional
    public List<Long> getTeamMembers(Long ideaId) throws ResourceNotFoundException {
        log.info("Fetching team members for idea: {}", ideaId);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + ideaId));

        return idea.getAssignedTeam();
    }


    private void validateStatusTransition(IdeaStatus currentStatus, IdeaStatus newStatus) {
        boolean isValidTransition = false;

        switch (currentStatus) {
            case DRAFT:
                isValidTransition = newStatus == IdeaStatus.SUBMITTED;
                break;
            case SUBMITTED:
                isValidTransition = newStatus == IdeaStatus.UNDER_REVIEW ||
                        newStatus == IdeaStatus.REJECTED;
                break;
            case UNDER_REVIEW:
                isValidTransition = newStatus == IdeaStatus.APPROVED ||
                        newStatus == IdeaStatus.REJECTED;
                break;
            case APPROVED:
                isValidTransition = newStatus == IdeaStatus.ASSIGNING_TEAM;
                break;
            case ASSIGNING_TEAM:
                isValidTransition = newStatus == IdeaStatus.IN_PROGRESS;
                break;
            case IN_PROGRESS:
                isValidTransition = newStatus == IdeaStatus.COMPLETED;
                break;
            case COMPLETED:
            case REJECTED:
                isValidTransition = false;
                break;
        }

        if (!isValidTransition) {
            throw new BadRequestException(
                    String.format("Invalid status transition from %s to %s", currentStatus, newStatus)
            );
        }
    }

    @Override
    public void updateVoteCount(Long ideaId, Integer voteCount) {
        log.info("Updating vote_count field for idea {} to {} (total votes from vote service)", ideaId, voteCount);
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + ideaId));
        
        // vote_count field in database stores the total number of votes for this idea
        idea.setVoteCount(voteCount);
        ideaRepository.save(idea);
        log.info("vote_count updated successfully for idea {} (total votes: {})", ideaId, voteCount);
    }
}