package com.example.voteservice.mapper;

import com.example.voteservice.Model.Dto.FeedbackDto;
import com.example.voteservice.Model.entities.Feedback;
import org.springframework.stereotype.Component;

@Component
public class FeedbackMapperImpl implements FeedbackMapper {

    @Override
    public Feedback toEntity(FeedbackDto dto) {
        Feedback f = new Feedback();
        f.setId(dto.getId());
        f.setUserId(dto.getUserId());
        f.setIdeaId(dto.getIdeaId());
        f.setComment(dto.getComment());
        return f;
    }

    @Override
    public FeedbackDto toDto(Feedback feedback) {
        FeedbackDto dto = new FeedbackDto();
        dto.setId(feedback.getId());
        dto.setUserId(feedback.getUserId());
        dto.setIdeaId(feedback.getIdeaId());
        dto.setComment(feedback.getComment());
        return dto;
    }
}
