package com.example.workflow.mapper;

import com.example.workflow.Model.Dto.WorkflowStepCreateRequest;
import com.example.workflow.Model.Dto.WorkflowStepDTO;
import com.example.workflow.Model.Dto.WorkflowStepUpdateRequest;
import com.example.workflow.Model.Entities.WorkflowStep;
import com.example.workflow.Model.Enums.WorkflowStatus;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class WorkflowMapperImpl implements WorkflowMapper {

    @Override
    public WorkflowStepDTO toDTO(WorkflowStep step) {
        if (step == null) return null;
        WorkflowStepDTO dto = new WorkflowStepDTO();
        dto.setId(step.getId());
        dto.setIdeaId(step.getIdeaId());
        dto.setUserId(step.getUserId());
        dto.setStepType(step.getStepType());
        dto.setStatus(step.getStatus());
        dto.setActionDate(step.getActionDate());
        dto.setComments(step.getComments());
        return dto;
    }

    @Override
    public List<WorkflowStepDTO> toDTOList(List<WorkflowStep> steps) {
        if (steps == null) return null;
        return steps.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public WorkflowStep toEntity(WorkflowStepCreateRequest request) {
        if (request == null) return null;
        WorkflowStep step = new WorkflowStep();
        step.setIdeaId(request.getIdeaId());
        step.setUserId(request.getUserId());
        step.setStepType(request.getStepType());
        step.setStatus(WorkflowStatus.PENDING);
        step.setActionDate(new Date());
        step.setComments(request.getComments());
        return step;
    }

    @Override
    public void updateEntityFromDTO(WorkflowStepUpdateRequest request, WorkflowStep step) {
        if (request == null || step == null) return;
        if (request.getIdeaId() != null) step.setIdeaId(request.getIdeaId());
        if (request.getUserId() != null) step.setUserId(request.getUserId());
        if (request.getStepType() != null) step.setStepType(request.getStepType());
        if (request.getStatus() != null) step.setStatus(request.getStatus());
        if (request.getActionDate() != null) step.setActionDate(request.getActionDate());
        if (request.getComments() != null) step.setComments(request.getComments());
    }
}
