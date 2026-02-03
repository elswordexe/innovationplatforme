package com.example.workflow.Controller;

import com.example.workflow.Exceptions.ResourceNotFoundException;
import com.example.workflow.Model.Dto.WorkflowStepCreateRequest;
import com.example.workflow.Model.Dto.WorkflowStepDTO;
import com.example.workflow.Model.Dto.WorkflowStepUpdateRequest;
import com.example.workflow.Service.WorkflowServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
@Tag(name = "Workflow Crud Operations", description = "APIs pour les opérations CRUD du workflow")
public class WorkflowCrudController {

    private final WorkflowServiceImpl workflowService;

    @PostMapping
    @Operation(summary = "Créer une nouvelle étape", description = "Permet de créer une nouvelle étape de workflow")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Étape créée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = WorkflowStepDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content)
    })
    public ResponseEntity<WorkflowStepDTO> createStep(
            @Valid @RequestBody WorkflowStepCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        WorkflowStepDTO created = workflowService.createStep(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une étape par ID", description = "Retourne les détails d'une étape")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Étape trouvée",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = WorkflowStepDTO.class))),
            @ApiResponse(responseCode = "404", description = "Étape non trouvée", content = @Content)
    })
    public ResponseEntity<WorkflowStepDTO> getStepById(
            @Parameter(description = "ID de l'étape", required = true, example = "1")
            @PathVariable Long id) throws ResourceNotFoundException {
        return ResponseEntity.ok(workflowService.getStepById(id));
    }

    @GetMapping
    @Operation(summary = "Récupérer toutes les étapes", description = "Retourne une liste de toutes les étapes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des étapes récupérée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class)))
    })
    public ResponseEntity<List<WorkflowStepDTO>> getAllSteps() {
        return ResponseEntity.ok(workflowService.getAllSteps());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une étape", description = "Permet de modifier une étape de workflow")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Étape mise à jour avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = WorkflowStepDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content),
            @ApiResponse(responseCode = "404", description = "Étape non trouvée", content = @Content)
    })
    public ResponseEntity<WorkflowStepDTO> updateStep(
            @Parameter(description = "ID de l'étape", required = true, example = "1")
            @PathVariable Long id,
            @Valid @RequestBody WorkflowStepUpdateRequest request
    ) throws ResourceNotFoundException {
        return ResponseEntity.ok(workflowService.updateStep(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une étape", description = "Permet de supprimer une étape")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Étape supprimée avec succès", content = @Content),
            @ApiResponse(responseCode = "404", description = "Étape non trouvée", content = @Content)
    })
    public ResponseEntity<Void> deleteStep(
            @Parameter(description = "ID de l'étape", required = true, example = "1")
            @PathVariable Long id) throws ResourceNotFoundException {
        workflowService.deleteStep(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    @Operation(summary = "Vérifier la santé du service", description = "Endpoint de test simple")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Workflow Service is running!");
    }
}
