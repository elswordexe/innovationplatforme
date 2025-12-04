package com.example.ideaservice.Service;


import com.example.ideaservice.Exceptions.ResourceNotFoundException;
import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Model.entities.Idea;
import com.example.ideaservice.Model.enums.IdeaStatus;
import com.example.ideaservice.Repository.IdeaRepository;
import com.example.ideaservice.mapper.IdeaMapper;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class IdeaServiceImpl implements IdeaService {

    private final IdeaRepository ideaRepository;
    private final IdeaMapper ideaMapper;

    // ============================
    // CRUD Operations
    // ============================

    @Override
    public IdeaDTO createIdea(IdeaCreateRequest request, Long creatorId) {
        log.info("Creating new idea with title: {} for creator: {}", request.getTitle(), creatorId);

        Idea idea = ideaMapper.toEntity(request);
        idea.setCreatorId(creatorId);

        // Si organizationId n'est pas fourni, on peut le récupérer via User Service plus tard
        if (request.getOrganizationId() != null) {
            idea.setOrganizationId(request.getOrganizationId());
        } else {
            // Pour les tests, mettre une valeur par défaut
            idea.setOrganizationId(1L);
        }

        Idea savedIdea = ideaRepository.save(idea);
        log.info("Idea created successfully with id: {}", savedIdea.getId());

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
    @Transactional
    public Page<IdeaDTO> getAllIdeas(Pageable pageable) {
        log.info("Fetching all ideas with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<Idea> ideas = ideaRepository.findAll(pageable);
        return ideas.map(ideaMapper::toDTO);
    }


    @Override
    public IdeaDTO updateIdea(Long id, IdeaUpdateRequest request) throws ResourceNotFoundException {
        log.info("Updating idea with id: {}", id);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        // Vérifier si l'idée peut être modifiée
        if (idea.getStatus() != IdeaStatus.DRAFT) {
            throw new BadRequestException("Only ideas in DRAFT status can be modified");
        }

        // Mettre à jour les champs modifiables
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
    public void deleteIdea(Long id) throws ResourceNotFoundException {
        log.info("Deleting idea with id: {}", id);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        // Vérifier si l'idée peut être supprimée
        if (idea.getStatus() != IdeaStatus.DRAFT) {
            throw new BadRequestException("Only ideas in DRAFT status can be deleted");
        }

        ideaRepository.delete(idea);
        log.info("Idea deleted successfully with id: {}", id);
    }

    // ============================
    // Status Management
    // ============================

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

        // TODO: Déclencher le workflow d'approbation via WorkflowService
        // TODO: Envoyer une notification via NotificationService

        return ideaMapper.toDTO(updatedIdea);
    }

    @Override
    public IdeaDTO changeStatus(Long id, IdeaStatus newStatus) throws ResourceNotFoundException {
        log.info("Changing status of idea {} to {}", id, newStatus);

        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea not found with id: " + id));

        // Valider les transitions de statut
        validateStatusTransition(idea.getStatus(), newStatus);

        idea.setStatus(newStatus);
        Idea updatedIdea = ideaRepository.save(idea);

        log.info("Status changed successfully for idea {}", id);

        return ideaMapper.toDTO(updatedIdea);
    }

    // ============================
    // Filtering and Search
    // ============================

    @Override
    @Transactional
    public Page<IdeaDTO> getIdeasByStatus(IdeaStatus status, Pageable pageable) {
        log.info("Fetching ideas with status: {}", status);

        Page<Idea> ideas = ideaRepository.findByStatus(status, pageable);
        return ideas.map(ideaMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<IdeaDTO> getIdeasByCreator(Long creatorId, Pageable pageable) {
        log.info("Fetching ideas created by user: {}", creatorId);

        Page<Idea> ideas = ideaRepository.findByCreatorId(creatorId, pageable);
        return ideas.map(ideaMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<IdeaDTO> getIdeasByOrganization(Long organizationId, Pageable pageable) {
        log.info("Fetching ideas for organization: {}", organizationId);

        Page<Idea> ideas = ideaRepository.findByOrganizationId(organizationId, pageable);
        return ideas.map(ideaMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<IdeaDTO> searchIdeas(String keyword, Pageable pageable) {
        log.info("Searching ideas with keyword: {}", keyword);

        Page<Idea> ideas = ideaRepository.searchByKeyword(keyword, pageable);
        return ideas.map(ideaMapper::toDTO);
    }

    // ============================
    // Top Ideas
    // ============================

    @Override
    @Transactional
    public List<IdeaDTO> getTop10Ideas() {
        log.info("Fetching top 10 ideas");

        Pageable topTen = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "totalScore"));
        Page<Idea> topIdeas = ideaRepository.findAll(topTen);

        return topIdeas.getContent().stream()
                .map(ideaMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ============================
    // Budget Management
    // ============================

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

        // TODO: Envoyer notification via NotificationService

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

    // ============================
    // Team Management
    // ============================

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

        idea.addTeamMember(userId);

        // Changer le statut si nécessaire
        if (idea.getStatus() == IdeaStatus.APPROVED) {
            idea.setStatus(IdeaStatus.ASSIGNING_TEAM);
        }

        Idea updatedIdea = ideaRepository.save(idea);

        log.info("User {} added to idea {} team", userId, ideaId);

        // TODO: Créer l'entrée TeamAssignment via TeamService
        // TODO: Envoyer notification via NotificationService

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

    // ============================
    // Private Helper Methods
    // ============================

    private void validateStatusTransition(IdeaStatus currentStatus, IdeaStatus newStatus) {
        // Définir les transitions valides
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
                isValidTransition = false; // États finaux
                break;
        }

        if (!isValidTransition) {
            throw new BadRequestException(
                    String.format("Invalid status transition from %s to %s", currentStatus, newStatus)
            );
        }
    }
}