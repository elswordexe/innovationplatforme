package com.example.workflow.mapper;

import com.example.workflow.Model.Dto.WorkflowStepCreateRequest;
import com.example.workflow.Model.Dto.WorkflowStepDTO;
import com.example.workflow.Model.Dto.WorkflowStepUpdateRequest;
import com.example.workflow.Model.Entities.WorkflowStep;

import java.util.List;

public interface WorkflowMapper {
    WorkflowStepDTO toDTO(WorkflowStep step);
    List<WorkflowStepDTO> toDTOList(List<WorkflowStep> steps);
    WorkflowStep toEntity(WorkflowStepCreateRequest request);
    void updateEntityFromDTO(WorkflowStepUpdateRequest request, WorkflowStep step);
}
