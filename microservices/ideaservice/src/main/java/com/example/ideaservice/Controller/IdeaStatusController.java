package com.example.ideaservice.Controller;

import com.example.ideaservice.Exceptions.ResourceNotFoundException;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.status.IdeaStatusUpdateRequest;
import com.example.ideaservice.Service.IdeaServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
@Tag(name = "Idea Status Management", description = "APIs pour la gestion des statuts des idées")
public class IdeaStatusController {
    private final IdeaServiceImpl ideaService;

    @PatchMapping("/{id}/submit")
    @Operation(summary = "Soumettre une idée")
    public ResponseEntity<IdeaDTO> submitIdea(@PathVariable Long id) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.submitIdea(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Changer le statut d'une idée")
    public ResponseEntity<IdeaDTO> changeIdeaStatus(
            @PathVariable Long id,
            @RequestBody IdeaStatusUpdateRequest request) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.changeStatus(id, request.getStatus()));
    }

    @PatchMapping("/{id}/budget/approve")
    @Operation(summary = "Approuver le budget d'une idée")
    public ResponseEntity<IdeaDTO> approveBudget(@PathVariable Long id) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.approveBudget(id));
    }

    @PatchMapping("/{id}/budget/reject")
    @Operation(summary = "Rejeter le budget d'une idée")
    public ResponseEntity<IdeaDTO> rejectBudget(@PathVariable Long id) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.rejectBudget(id));
    }
}
