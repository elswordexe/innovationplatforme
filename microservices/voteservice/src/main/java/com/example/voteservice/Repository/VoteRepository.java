package com.example.voteservice.Repository;

import com.example.voteservice.Model.entities.Vote;
import com.example.voteservice.Model.enums.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface VoteRepository extends JpaRepository<Vote, Long> {

    List<Vote> findByUserId(Long userId);

    List<Vote> findByIdeaId(Long ideaId);

    long countByIdeaId(Long ideaId);

    long countByIdeaIdAndVoteType(Long ideaId, VoteType voteType);

    // 🆕 COUNT BY USER
    long countByUserId(Long userId);

    // 🆕 HAS VOTED
    boolean existsByUserIdAndIdeaId(Long userId, Long ideaId);
}
