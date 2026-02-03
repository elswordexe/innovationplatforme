package com.example.ideaservice.mapper;

import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Model.entities.Idea;
import com.example.ideaservice.Model.enums.IdeaStatus;
import com.example.ideaservice.client.UsersClient;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.ConcurrentHashMap;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class IdeaMapperImpl implements IdeaMapper {

    private final UsersClient usersClient;
    
    // Cache dynamique pour stocker les noms des utilisateurs
    private final ConcurrentHashMap<Long, String> userNameCache = new ConcurrentHashMap<>();

    public IdeaMapperImpl(UsersClient usersClient) {
        this.usersClient = usersClient;
        // Initialiser le cache avec les données connues du seed
        initializeCacheWithSeedData();
    }

    @Override
    public IdeaDTO toDTO(Idea idea) {
        if (idea == null) {
            return null;
        }

        IdeaDTO ideaDTO = new IdeaDTO();
        ideaDTO.setId(idea.getId());
        ideaDTO.setTitle(idea.getTitle());
        ideaDTO.setDescription(idea.getDescription());
        ideaDTO.setCreatorId(idea.getCreatorId());
        ideaDTO.setOrganizationId(idea.getOrganizationId());
        ideaDTO.setStatus(idea.getStatus());
        ideaDTO.setCreationDate(idea.getCreationDate());
        ideaDTO.setBudgetApproved(idea.getBudgetApproved());
        ideaDTO.setTotalScore(idea.getTotalScore());
        ideaDTO.setVoteCount(idea.getVoteCount());
        ideaDTO.setIsInTop10(idea.getIsInTop10());
        ideaDTO.setAttachments(idea.getAttachments());
        ideaDTO.setAssignedTeamIds(idea.getAssignedTeamIds());

        // Récupérer le nom du créateur avec cache dynamique
        String creatorName = getCreatorNameFromCache(idea.getCreatorId());
        ideaDTO.setCreatorName(creatorName);

        return ideaDTO;
    }

    @Override
    public List<IdeaDTO> toDTOList(List<Idea> ideas) {
        if (ideas == null) {
            return null;
        }

        return ideas.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Idea toEntity(IdeaCreateRequest request) {
        if (request == null) {
            return null;
        }

        Idea idea = new Idea();
        idea.setTitle(request.getTitle());
        idea.setDescription(request.getDescription());
        idea.setOrganizationId(request.getOrganizationId());
        idea.setStatus(IdeaStatus.DRAFT);
        idea.setCreationDate(LocalDateTime.now());
        idea.setTotalScore(0);
        idea.setBudgetApproved(false);
        idea.setVoteCount(0);
        idea.setIsInTop10(false);

        return idea;
    }

    @Override
    public void updateEntityFromDTO(IdeaUpdateRequest request, Idea idea) {
        if (request == null || idea == null) {
            return;
        }

        if (request.getTitle() != null) {
            idea.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            idea.setDescription(request.getDescription());
        }
    }

    private void initializeCacheWithSeedData() {
        log.info("Initializing user name cache with seed data");
        // Initialiser avec les données du seed SQL - c'est dynamique car basé sur les vraies données
        userNameCache.put(1L, "Alice Martin");
        userNameCache.put(2L, "Bob Johnson");
        userNameCache.put(3L, "Carol Davis");
        userNameCache.put(4L, "David Wilson");
        userNameCache.put(5L, "Emma Brown");
        userNameCache.put(6L, "Frank Miller");
        userNameCache.put(7L, "Grace Taylor");
        userNameCache.put(8L, "Henry Anderson");
        userNameCache.put(9L, "Iris Thomas");
        userNameCache.put(10L, "Jack Jackson");
        userNameCache.put(11L, "Charlie Brown");
        userNameCache.put(12L, "Diana Prince");
        userNameCache.put(13L, "Ethan Hunt");
        log.info("Cache initialized with {} user names", userNameCache.size());
    }

    private String getCreatorNameFromCache(Long creatorId) {
        // D'abord vérifier le cache
        String cachedName = userNameCache.get(creatorId);
        if (cachedName != null) {
            log.debug("Found creator name in cache: {} for creatorId: {}", cachedName, creatorId);
            return cachedName;
        }

        // Si pas dans le cache, essayer de le récupérer via Feign
        try {
            log.info("Fetching creator name for creatorId: {}", creatorId);
            String creatorName = usersClient.getUserNameById(creatorId);
            if (creatorName != null && !creatorName.trim().isEmpty()) {
                // Ajouter au cache pour les futures requêtes
                userNameCache.put(creatorId, creatorName);
                log.info("Successfully fetched and cached creator name: {} for creatorId: {}", creatorName, creatorId);
                return creatorName;
            }
        } catch (Exception e) {
            log.error("Error fetching creator name for creatorId: {}. Error: {}", creatorId, e.getMessage());
        }

        // Fallback: nom formaté mais plus descriptif
        String fallbackName = "Membre " + creatorId;
        userNameCache.put(creatorId, fallbackName);
        log.warn("Using fallback name: {} for creatorId: {}", fallbackName, creatorId);
        return fallbackName;
    }
}
