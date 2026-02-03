package com.example.workflow.Model.Dto;

import com.example.workflow.Model.Enums.StepType;
import com.example.workflow.Model.Enums.WorkflowStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
public class WorkflowStepUpdateRequest {
    private Long ideaId;
    private Long userId;
    private StepType stepType;
    private WorkflowStatus status;
    private Date actionDate;
    private String comments;
}
