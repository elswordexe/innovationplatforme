package com.example.ideaservice.Controller;

import com.example.ideaservice.Exceptions.ResourceNotFoundException;
import com.example.ideaservice.Model.Dto.IdeaCreateRequest;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.IdeaUpdateRequest;
import com.example.ideaservice.Service.IdeaServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
@Tag(name = "Idea Crud Operations", description = "APIs pour les opérations CRUD des idées")
@CrossOrigin(origins = "*")
public class IdeaCrudController {
    private final IdeaServiceImpl ideaService;

    @PostMapping
    @Operation(summary = "Créer une nouvelle idée", description = "Permet de créer une nouvelle idée en brouillon")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Idée créée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = IdeaDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content)
    })
    public ResponseEntity<IdeaDTO> createIdea(
            @Valid @RequestBody IdeaCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        Long creatorId = (userId != null) ? userId : 1L;
        IdeaDTO createdIdea = ideaService.createIdea(request, creatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdIdea);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une idée par ID", description = "Retourne les détails complets d'une idée")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Idée trouvée",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = IdeaDTO.class))),
            @ApiResponse(responseCode = "404", description = "Idée non trouvée", content = @Content)
    })
    public ResponseEntity<IdeaDTO> getIdeaById(
            @Parameter(description = "ID de l'idée", required = true, example = "1")
            @PathVariable Long id) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.getIdeaById(id));
    }

    @GetMapping
    @Operation(summary = "Récupérer toutes les idées", description = "Retourne une liste paginée de toutes les idées")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des idées récupérée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    })
    public ResponseEntity<Page<IdeaDTO>> getAllIdeas(
            @Parameter(description = "Paramètres de pagination")
            @PageableDefault(size = 20, sort = "creationDate") Pageable pageable) {
        return ResponseEntity.ok(ideaService.getAllIdeas(pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une idée", description = "Permet de modifier une idée (titre, description)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Idée mise à jour avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = IdeaDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content),
            @ApiResponse(responseCode = "404", description = "Idée non trouvée", content = @Content)
    })
    public ResponseEntity<IdeaDTO> updateIdea(
            @Parameter(description = "ID de l'idée", required = true, example = "1")
            @PathVariable Long id,
            @Valid @RequestBody IdeaUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.updateIdea(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une idée", description = "Permet de supprimer une idée")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Idée supprimée avec succès", content = @Content),
            @ApiResponse(responseCode = "404", description = "Idée non trouvée", content = @Content)
    })
    public ResponseEntity<Void> deleteIdea(
            @Parameter(description = "ID de l'idée", required = true, example = "1")
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) throws ResourceNotFoundException {
        ideaService.deleteIdea(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    @Operation(summary = "Vérifier la santé du service", description = "Endpoint de test simple")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Idea Service is running!");
    }
}
