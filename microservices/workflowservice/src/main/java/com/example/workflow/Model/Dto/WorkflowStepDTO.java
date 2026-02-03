package com.example.workflow.Model.Dto;

import com.example.workflow.Model.Enums.StepType;
import com.example.workflow.Model.Enums.WorkflowStatus;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowStepDTO {
    private Long id;
    private Long ideaId;
    private Long userId;
    private StepType stepType;
    private WorkflowStatus status;
    private Date actionDate;
    private String comments;
}
