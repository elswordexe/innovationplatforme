package com.example.workflow.Model.Entities;

import com.example.workflow.Model.Enums.StepType;
import com.example.workflow.Model.Enums.WorkflowStatus;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkflowStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long ideaId;
    private Long UserId;//li ki approuver
    private StepType stepType;
    private WorkflowStatus status;
    private Date actiondate;
    private String comments;
}
