package com.example.ideaservice.Repository;

import com.example.ideaservice.Model.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByIdeaIdOrderByCreatedAtDesc(Long ideaId);
    List<Comment> findByAuthorId(Long authorId);
    List<Comment> findByIdeaIdAndOrganizationId(Long ideaId, Long organizationId);
}
