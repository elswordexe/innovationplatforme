package com.example.voteservice.mapper;

import com.example.voteservice.Model.Dto.FeedbackDto;
import com.example.voteservice.Model.entities.Feedback;

public interface FeedbackMapper {
    Feedback toEntity(FeedbackDto dto);
    FeedbackDto toDto(Feedback feedback);
}
