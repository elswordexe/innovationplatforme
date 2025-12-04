package com.example.ideaservice.Repository;

import com.example.ideaservice.Model.entities.Idea;
import com.example.ideaservice.Model.enums.IdeaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {

    List<Idea> findByStatus(IdeaStatus status);
    List<Idea> findByCreatorId(Long creatorId);
    List<Idea> findByOrganizationId(Long organizationId);
    @Query("SELECT i FROM Idea i WHERE " +
            "LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Idea> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT i FROM Idea i WHERE i.totalScore >= :minScore ORDER BY i.totalScore DESC")
    List<Idea> findIdeasWithMinScore(@Param("minScore") Integer minScore);

    @Query("SELECT i FROM Idea i ORDER BY i.totalScore DESC")
    Page<Idea> findTopIdeas(Pageable pageable);

    Long countByStatus(IdeaStatus status);

    Long countByCreatorId(Long creatorId);

    @Query("SELECT i FROM Idea i WHERE i.status = :status AND i.budgetApproved = true")
    Page<Idea> findApprovedIdeasWithBudget(@Param("status") IdeaStatus status, Pageable pageable);
}
