package com.example.voteservice.Service;

import com.example.voteservice.Exceptions.ResourceNotFoundException;
import com.example.voteservice.Model.Dto.FeedbackDto;
import com.example.voteservice.Repository.FeedbackRepository;
import com.example.voteservice.mapper.FeedbackMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository repository;
    private final FeedbackMapper mapper;

    public FeedbackServiceImpl(FeedbackRepository repository,
                               FeedbackMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // ================= ADD =================
    @Override
    public FeedbackDto addFeedback(FeedbackDto dto) {
        return mapper.toDto(
                repository.save(
                        mapper.toEntity(dto)
                )
        );
    }

    // ================= GET BY ID =================
    @Override
    public FeedbackDto getFeedback(Long id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Feedback not found with id " + id)
                );
    }

    // ================= GET BY IDEA =================
    @Override
    public List<FeedbackDto> getFeedbacksByIdea(Long ideaId) {
        return repository.findByIdeaId(ideaId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // ================= DELETE =================
    @Override
    public void deleteFeedback(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback not found with id " + id);
        }
        repository.deleteById(id);
    }

    // ================= COUNT =================
    @Override
    public long countFeedbacksByIdea(Long ideaId) {
        return repository.countByIdeaId(ideaId);
    }

    @Override
    public long countFeedbacksByUser(Long userId) {
        return repository.countByUserId(userId);
    }
}
