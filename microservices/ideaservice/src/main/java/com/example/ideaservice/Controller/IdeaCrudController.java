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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
@Tag(name = "Idea Crud Operations", description = "APIs pour les opérations CRUD des idées")

public class IdeaCrudController {
    private final IdeaServiceImpl ideaService;

    @PostMapping
    @Operation(summary = "Créer une nouvelle idée", description = "Permet de créer une nouvelle idée en brouillon (org-scopée)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Idée créée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = IdeaDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content)
    })
    public ResponseEntity<IdeaDTO> createIdea(
            @Valid @RequestBody IdeaCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {
        if (userId == null || orgId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        IdeaDTO createdIdea = ideaService.createIdea(request, userId, orgId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdIdea);
    }

    @PostMapping(path = "/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Créer une nouvelle idée (multipart)", description = "Crée une idée et stocke l'image + les pièces jointes via multipart/form-data (org-scopée)")
    public ResponseEntity<IdeaDTO> createIdeaMultipart(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "attachments", required = false) java.util.List<MultipartFile> attachments,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {
        if (userId == null || orgId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        IdeaCreateRequest req = IdeaCreateRequest.builder()
                .title(title)
                .description(description)
                .category(category)
                .priority(priority)
                .build();

        IdeaDTO createdIdea = ideaService.createIdeaMultipart(req, image, attachments, userId, orgId);
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
    @Operation(summary = "Récupérer toutes les idées (org)", description = "Retourne les idées de l'organisation courante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des idées récupérée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content)
    })
    public ResponseEntity<List<IdeaDTO>> getAllIdeas(
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ideaService.getAllIdeasByOrg(orgId));
    }

    @GetMapping("/me")
    @Operation(summary = "Mes idées dans l'org courante", description = "Retourne les idées du user courant filtrées par org si fournie")
    public ResponseEntity<List<IdeaDTO>> getMyIdeas(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (orgId == null) {
            // fallback sans org: idées du user toutes orgs confondues
            return ResponseEntity.ok(ideaService.getIdeasByCreator(currentUserId));
        }
        return ResponseEntity.ok(ideaService.getIdeasByCreatorAndOrg(currentUserId, orgId));
    }

    @GetMapping("/byUser/{userId}")
    @Operation(summary = "Idées d'un utilisateur dans l'org courante", description = "Retourne les idées d'un user dans l'org courante")
    public ResponseEntity<List<IdeaDTO>> getIdeasByUserInOrg(
            @PathVariable Long userId,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ideaService.getIdeasByCreatorAndOrg(userId, orgId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une idée", description = "Permet de modifier une idée (titre, description)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Idée mise à jour avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = IdeaDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content),
            @ApiResponse(responseCode = "404", description = "Idée non trouvée", content = @Content),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès interdit", content = @Content)
    })
    public ResponseEntity<IdeaDTO> updateIdea(
            @Parameter(description = "ID de l'idée", required = true, example = "1")
            @PathVariable Long id,
            @Valid @RequestBody IdeaUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) throws ResourceNotFoundException {
        if (userId == null || orgId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ideaService.updateIdea(id, request, userId, orgId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une idée", description = "Permet de supprimer une idée")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Idée supprimée avec succès", content = @Content),
            @ApiResponse(responseCode = "404", description = "Idée non trouvée", content = @Content),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès interdit", content = @Content)
    })
    public ResponseEntity<Void> deleteIdea(
            @Parameter(description = "ID de l'idée", required = true, example = "1")
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) throws ResourceNotFoundException {
        if (userId == null || orgId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ideaService.deleteIdea(id, userId, orgId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    @Operation(summary = "Vérifier la santé du service", description = "Endpoint de test simple")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Idea Service is running!");
    }

    @PutMapping("/{id}/voteCount")
    @Operation(summary = "Mettre à jour le nombre de votes", description = "Met à jour le voteCount d'une idée")
    public ResponseEntity<Void> updateVoteCount(
            @Parameter(description = "ID de l'idée", required = true, example = "1")
            @PathVariable Long id,
            @RequestBody Integer voteCount) {
        ideaService.updateVoteCount(id, voteCount);
        return ResponseEntity.ok().build();
    }
}
