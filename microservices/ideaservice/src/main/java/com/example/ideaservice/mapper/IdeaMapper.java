
package com.example.ideaservice.mapper;

import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Model.entities.Idea;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IdeaMapper {

    IdeaDTO toDTO(Idea idea);

    List<IdeaDTO> toDTOList(List<Idea> ideas);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creationDate", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "totalScore", constant = "0")
    @Mapping(target = "budgetApproved", constant = "false")
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "assignedTeamIds", ignore = true)
    @Mapping(target = "voteCount", ignore = true)
    @Mapping(target = "isInTop10", ignore = true)
    Idea toEntity(IdeaCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(IdeaUpdateRequest request, @MappingTarget Idea idea);
}
