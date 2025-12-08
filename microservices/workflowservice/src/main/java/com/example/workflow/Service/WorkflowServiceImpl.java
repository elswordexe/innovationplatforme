package com.example.workflow.Service;

import com.example.workflow.Exceptions.ResourceNotFoundException;
import com.example.workflow.Model.Dto.WorkflowStepCreateRequest;
import com.example.workflow.Model.Dto.WorkflowStepDTO;
import com.example.workflow.Model.Dto.WorkflowStepUpdateRequest;
import com.example.workflow.Model.Entities.WorkflowStep;
import com.example.workflow.Repository.WorkflowRepository;
import com.example.workflow.mapper.WorkflowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowMapper workflowMapper;

    @Override
    public WorkflowStepDTO createStep(WorkflowStepCreateRequest request) {
        WorkflowStep entity = workflowMapper.toEntity(request);
        WorkflowStep saved = workflowRepository.save(entity);
        return workflowMapper.toDTO(saved);
    }

    @Override
    public WorkflowStepDTO getStepById(Long id) throws ResourceNotFoundException {
        WorkflowStep step = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow step not found with id: " + id));
        return workflowMapper.toDTO(step);
    }

    @Override
    public List<WorkflowStepDTO> getAllSteps() {
        return workflowMapper.toDTOList(workflowRepository.findAll());
    }

    @Override
    public WorkflowStepDTO updateStep(Long id, WorkflowStepUpdateRequest request) throws ResourceNotFoundException {
        WorkflowStep existing = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow step not found with id: " + id));
        workflowMapper.updateEntityFromDTO(request, existing);
        WorkflowStep saved = workflowRepository.save(existing);
        return workflowMapper.toDTO(saved);
    }

    @Override
    public void deleteStep(Long id) throws ResourceNotFoundException {
        WorkflowStep existing = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow step not found with id: " + id));
        workflowRepository.delete(existing);
    }
}
