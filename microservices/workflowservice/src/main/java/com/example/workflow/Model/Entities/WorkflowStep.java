package com.example.workflow.Model.Entities;

import com.example.workflow.Model.Enums.StepType;
import com.example.workflow.Model.Enums.WorkflowStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "workflow_steps")
public class WorkflowStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long ideaId;
    private Long userId; // approver user id
    @Enumerated(EnumType.STRING)
    private StepType stepType;
    @Enumerated(EnumType.STRING)
    private WorkflowStatus status;
    @Temporal(TemporalType.TIMESTAMP)
    private Date actionDate;
    private String comments;
}
