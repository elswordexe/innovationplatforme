package com.example.ideaservice.mapper;

import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Model.entities.Idea;
import com.example.ideaservice.Model.enums.IdeaStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class IdeaMapperImpl implements IdeaMapper {

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
}
