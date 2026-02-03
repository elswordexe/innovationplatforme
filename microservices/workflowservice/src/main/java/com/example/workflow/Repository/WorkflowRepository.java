package com.example.workflow.Repository;

import com.example.workflow.Model.Entities.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkflowRepository extends JpaRepository <WorkflowStep,Long > {
}
