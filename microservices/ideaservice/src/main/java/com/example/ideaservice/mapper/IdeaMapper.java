
package com.example.ideaservice.mapper;

import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Model.entities.Idea;
import java.util.List;

public interface IdeaMapper {
    IdeaDTO toDTO(Idea idea);
    List<IdeaDTO> toDTOList(List<Idea> ideas);
    Idea toEntity(IdeaCreateRequest request);
    void updateEntityFromDTO(IdeaUpdateRequest request, Idea idea);
}
