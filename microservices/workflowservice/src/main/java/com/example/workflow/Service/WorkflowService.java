package com.example.workflow.Service;

import com.example.workflow.Exceptions.ResourceNotFoundException;
import com.example.workflow.Model.Dto.WorkflowStepCreateRequest;
import com.example.workflow.Model.Dto.WorkflowStepDTO;
import com.example.workflow.Model.Dto.WorkflowStepUpdateRequest;

import java.util.List;

public interface WorkflowService {
    WorkflowStepDTO createStep(WorkflowStepCreateRequest request);
    WorkflowStepDTO getStepById(Long id) throws ResourceNotFoundException;
    List<WorkflowStepDTO> getAllSteps();
    WorkflowStepDTO updateStep(Long id, WorkflowStepUpdateRequest request) throws ResourceNotFoundException;
    void deleteStep(Long id) throws ResourceNotFoundException;
}
