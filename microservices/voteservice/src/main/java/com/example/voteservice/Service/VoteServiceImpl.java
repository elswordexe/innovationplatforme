package com.example.voteservice.Service;

import com.example.voteservice.Exceptions.ResourceNotFoundException;
import com.example.voteservice.Model.Dto.VoteDto;
import com.example.voteservice.Model.entities.Vote;
import com.example.voteservice.Model.enums.VoteType;
import com.example.voteservice.Repository.VoteRepository;
import com.example.voteservice.client.IdeaClient;
import com.example.voteservice.mapper.VoteMapper;
import com.example.voteservice.messaging.NotificationEvent;
import com.example.voteservice.messaging.NotificationPublisher;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class VoteServiceImpl implements VoteService {

    private final VoteRepository repo;
    private final VoteMapper mapper;
    private final NotificationPublisher notificationPublisher;
    private final IdeaClient ideaClient;

    public VoteServiceImpl(VoteRepository repo, VoteMapper mapper,
                           NotificationPublisher notificationPublisher,
                           IdeaClient ideaClient) {
        this.repo = repo;
        this.mapper = mapper;
        this.notificationPublisher = notificationPublisher;
        this.ideaClient = ideaClient;
    }

 

    @Override
    public VoteDto addVote(VoteDto dto, String actorName) {

        // empêcher double vote
        if (repo.existsByUserIdAndIdeaId(dto.getUserId(), dto.getIdeaId())) {
            throw new RuntimeException("User already voted for this idea");
        }

        Vote saved = repo.save(mapper.toEntity(dto));

        // Build and publish notification (only on add)
        long total = repo.countByIdeaId(dto.getIdeaId());
        Long ownerId = ideaClient.getIdeaOwnerId(dto.getIdeaId());
        if (ownerId != null) {
            String msg = buildVoteMessage(actorName, total);
            NotificationEvent event = NotificationEvent.builder()
                    .userId(ownerId)
                    .type("VOTE_ACTIVITY")
                    .title("Nouveau vote")
                    .message(msg)
                    .createdAt(Instant.now())
                    .build();
            notificationPublisher.publish(String.valueOf(dto.getIdeaId()), event);
        }

        return mapper.toDto(saved);
    }

    private String buildVoteMessage(String actorName, long total) {
        String name = (actorName == null || actorName.isBlank()) ? "Quelqu'un" : actorName;
        if (total <= 1) {
            return name + " a voté pour votre idée";
        }
        long others = total - 1;
        return name + " et " + others + " autre" + (others > 1 ? "s" : "") + " ont voté pour votre idée";
    }

    // ================= GET BY ID =================
    @Override
    public VoteDto getVote(Long id) {
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Vote not found with id " + id)
                );
    }

    // ================= GET BY USER =================
    @Override
    public List<VoteDto> getVotesByUser(Long userId) {
        return repo.findByUserId(userId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // ================= GET BY IDEA =================
    @Override
    public List<VoteDto> getVotesByIdea(Long ideaId) {
        return repo.findByIdeaId(ideaId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // ================= DELETE =================
    @Override
    public void deleteVote(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Vote not found with id " + id);
        }
        repo.deleteById(id);
        // No notification on delete (per requirements)
    }

    // ================= COUNT =================
    @Override
    public long countVotesByIdea(Long ideaId) {
        return repo.countByIdeaId(ideaId);
    }

    @Override
    public long countVotesByIdeaAndType(Long ideaId, VoteType type) {
        return repo.countByIdeaIdAndVoteType(ideaId, type);
    }

    @Override
    public long countVotesByUser(Long userId) {
        return repo.countByUserId(userId);
    }

    // ================= HAS VOTED =================
    @Override
    public boolean hasVoted(Long userId, Long ideaId) {
        return repo.existsByUserIdAndIdeaId(userId, ideaId);
    }
}
