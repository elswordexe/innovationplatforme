package com.example.workflow.Model.Dto;

import com.example.workflow.Model.Enums.StepType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WorkflowStepCreateRequest {
    @NotNull
    private Long ideaId;
    @NotNull
    private Long userId; // approver id creating the step for
    @NotNull
    private StepType stepType;
    private String comments;
}
