package com.example.voteservice.Service;

import com.example.voteservice.Model.Dto.VoteDto;
import com.example.voteservice.Model.enums.VoteType;

import java.util.List;

public interface VoteService {

    VoteDto addVote(VoteDto dto, String actorName);

    VoteDto getVote(Long id);

    List<VoteDto> getVotesByUser(Long userId);

    List<VoteDto> getVotesByIdea(Long ideaId);

    void deleteVote(Long id);

    // 🆕 COUNT
    long countVotesByIdea(Long ideaId);

    long countVotesByIdeaAndType(Long ideaId, VoteType type);

    long countVotesByUser(Long userId);

    // 🆕 HAS VOTED
    boolean hasVoted(Long userId, Long ideaId);
}
