package com.example.voteservice.Service;

import com.example.voteservice.Exceptions.ResourceNotFoundException;
import com.example.voteservice.Model.Dto.VoteDto;
import com.example.voteservice.Model.entities.Vote;
import com.example.voteservice.Model.enums.VoteType;
import com.example.voteservice.Repository.VoteRepository;
import com.example.voteservice.mapper.VoteMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoteServiceImpl implements VoteService {

    private final VoteRepository repo;
    private final VoteMapper mapper;

    public VoteServiceImpl(VoteRepository repo, VoteMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    // ================= ADD =================
//    @Override
//    public VoteDto addVote(VoteDto dto) {
//
//        // Option anti double vote
//        if (repo.existsByUserIdAndIdeaId(dto.getUserId(), dto.getIdeaId())) {
//            throw new RuntimeException("User already voted for this idea");
//        }
//
//        Vote vote = mapper.toEntity(dto);
//        Vote savedVote = repo.save(vote);
//        return mapper.toDto(savedVote);
//    }


    @Override
    public VoteDto addVote(VoteDto dto) {

        // empêcher double vote
        if (repo.existsByUserIdAndIdeaId(dto.getUserId(), dto.getIdeaId())) {
            throw new RuntimeException("User already voted for this idea");
        }

        return mapper.toDto(
                repo.save(
                        mapper.toEntity(dto)
                )
        );
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
