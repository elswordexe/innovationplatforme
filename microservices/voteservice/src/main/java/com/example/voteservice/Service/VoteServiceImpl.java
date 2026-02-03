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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
@Slf4j
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

        // Calculate total votes for this idea (this will be stored as vote_count in ideas table)
        long totalVotes = repo.countByIdeaId(dto.getIdeaId());
        Long ownerId = ideaClient.getIdeaOwnerId(dto.getIdeaId());
        
        // Update voteCount in Idea service (vote_count field in database = total number of votes)
        try {
            ideaClient.updateVoteCount(dto.getIdeaId(), (int) totalVotes);
            log.info("Updated vote_count for idea {} to {} (total votes)", dto.getIdeaId(), totalVotes);
        } catch (Exception e) {
            log.error("Failed to update vote_count for idea {}: {}", dto.getIdeaId(), e.getMessage());
        }
        
        if (ownerId != null) {
            String msg = buildVoteMessage(actorName, totalVotes);
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
    public void deleteVote(Long id, Long currentUserId) {
        Vote vote = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vote not found with id " + id));
        if (!vote.getUserId().equals(currentUserId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "You can only delete your own votes");
        }
        
        Long ideaId = vote.getIdeaId();
        repo.deleteById(id);
        
        // Update voteCount in Idea service after deletion (vote_count field = remaining total votes)
        try {
            long totalVotes = repo.countByIdeaId(ideaId);
            ideaClient.updateVoteCount(ideaId, (int) totalVotes);
            log.info("Updated vote_count for idea {} to {} after deletion (remaining votes)", ideaId, totalVotes);
        } catch (Exception e) {
            log.error("Failed to update vote_count for idea {} after deletion: {}", ideaId, e.getMessage());
        }
        
        // No notification on delete (per requirements)
    }

    // ================= UPDATE =================
    @Override
    public VoteDto updateVote(Long id, VoteDto dto, String actorName) {
        Vote existingVote = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vote not found with id " + id));
        
        if (!existingVote.getUserId().equals(dto.getUserId())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "You can only update your own votes");
        }
        
        // Update vote type if provided
        if (dto.getVoteType() != null) {
            existingVote.setVoteType(dto.getVoteType());
        }
        
        Vote updatedVote = repo.save(existingVote);
        return mapper.toDto(updatedVote);
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
