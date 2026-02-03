package com.example.voteservice.Service;

import com.example.voteservice.Model.Dto.FeedbackDto;

import java.util.List;

public interface FeedbackService {

    FeedbackDto addFeedback(FeedbackDto dto);

    FeedbackDto getFeedback(Long id);

    List<FeedbackDto> getFeedbacksByIdea(Long ideaId);

    void deleteFeedback(Long id);

    // 🆕 COUNT
    long countFeedbacksByIdea(Long ideaId);

    long countFeedbacksByUser(Long userId);
}
