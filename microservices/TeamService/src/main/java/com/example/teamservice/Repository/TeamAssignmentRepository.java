package com.example.teamservice.Repository;

import com.example.teamservice.Model.Entities.TeamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamAssignmentRepository extends JpaRepository<TeamAssignment, Long> {
    List<TeamAssignment> findByIdeaId(Long ideaId);
    List<TeamAssignment> findByUserId(Long userId);
}
