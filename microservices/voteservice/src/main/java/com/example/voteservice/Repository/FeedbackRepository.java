package com.example.voteservice.Repository;

import com.example.voteservice.Model.entities.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

        List<Feedback> findByIdeaId(Long ideaId);

        // 🆕 COUNT BY IDEA
        long countByIdeaId(Long ideaId);

        // 🆕 COUNT BY USER
        long countByUserId(Long userId);
}
