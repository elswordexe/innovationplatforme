package com.example.teamservice.Controller;

import com.example.teamservice.Exceptions.ResourceNotFoundException;
import com.example.teamservice.Model.Dto.TeamAssignmentCreateRequest;
import com.example.teamservice.Model.Dto.TeamAssignmentDTO;
import com.example.teamservice.Model.Dto.TeamAssignmentUpdateRequest;
import com.example.teamservice.Service.TeamAssignmentService;
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
@RequestMapping("/api/team-assignments")
@RequiredArgsConstructor
@Tag(name = "Team Assignments CRUD", description = "APIs pour la gestion des affectations d'équipe")
@CrossOrigin(origins = "*")
public class TeamAssignmentCrudController {

    private final TeamAssignmentService service;

    @PostMapping
    @Operation(summary = "Créer une nouvelle affectation", description = "Assigner un utilisateur à une idée avec un rôle")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Affectation créée",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamAssignmentDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content)
    })
    public ResponseEntity<TeamAssignmentDTO> create(@Valid @RequestBody TeamAssignmentCreateRequest request) {
        TeamAssignmentDTO created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une affectation par ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Trouvée",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TeamAssignmentDTO.class))),
            @ApiResponse(responseCode = "404", description = "Non trouvée", content = @Content)
    })
    public ResponseEntity<TeamAssignmentDTO> getById(
            @Parameter(description = "ID de l'affectation", required = true, example = "1")
            @PathVariable Long id
    ) throws ResourceNotFoundException {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Lister toutes les affectations")
    public ResponseEntity<List<TeamAssignmentDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/by-idea/{ideaId}")
    @Operation(summary = "Lister les affectations par idée")
    public ResponseEntity<List<TeamAssignmentDTO>> getByIdea(@PathVariable Long ideaId) {
        return ResponseEntity.ok(service.getByIdeaId(ideaId));
    }

    @GetMapping("/by-user/{userId}")
    @Operation(summary = "Lister les affectations par utilisateur")
    public ResponseEntity<List<TeamAssignmentDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUserId(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une affectation")
    public ResponseEntity<TeamAssignmentDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody TeamAssignmentUpdateRequest request
    ) throws ResourceNotFoundException {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une affectation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Supprimée", content = @Content),
            @ApiResponse(responseCode = "404", description = "Non trouvée", content = @Content)
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) throws ResourceNotFoundException {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    @Operation(summary = "Vérifier la santé du service")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Team Service is running!");
    }
}
