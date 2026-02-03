package com.example.ideaservice.Controller;

import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.enums.IdeaStatus;
import com.example.ideaservice.Service.IdeaServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
@Tag(name = "Idea Search", description = "APIs pour la recherche et le filtrage des idées")
public class IdeaSearchController {
    private final IdeaServiceImpl ideaService;

    @GetMapping("/status/{status}")
    @Operation(summary = "Récupérer les idées par statut", description = "Retourne une liste paginée des idées ayant un statut spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Idées récupérées avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class)))
    })
    public ResponseEntity<List<IdeaDTO>> getIdeasByStatus(
            @Parameter(description = "Statut des idées", required = true, example = "SUBMITTED")
            @PathVariable IdeaStatus status,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ideaService.getIdeasByStatusInOrg(status, orgId));
    }

    @GetMapping("/creator/{creatorId}")
    @Operation(summary = "Récupérer les idées par créateur (org)", description = "Retourne les idées d'un utilisateur dans l'organisation courante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Idées récupérées avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content)
    })
    public ResponseEntity<List<IdeaDTO>> getIdeasByCreator(
            @Parameter(description = "ID du créateur", required = true, example = "1")
            @PathVariable Long creatorId,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ideaService.getIdeasByCreatorAndOrg(creatorId, orgId));
    }

    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Récupérer les idées par organisation", description = "Retourne toutes les idées d'une organisation spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Idées récupérées avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class)))
    })
    public ResponseEntity<List<IdeaDTO>> getIdeasByOrganization(
            @Parameter(description = "ID de l'organisation", required = true, example = "1")
            @PathVariable Long organizationId) {
        // Optionnel: garder pour compat rétro; sinon, on pourrait imposer que organizationId == X-Tenant-Id
        return ResponseEntity.ok(ideaService.getIdeasByOrganization(organizationId));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des idées (org)", description = "Recherche des idées par mot-clé dans l'organisation courante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recherche effectuée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content)
    })
    public ResponseEntity<List<IdeaDTO>> searchIdeas(
            @Parameter(description = "Mot-clé de recherche", required = true, example = "innovation")
            @RequestParam String keyword,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId){
        if (orgId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ideaService.searchIdeasInOrg(keyword, orgId));
    }

    @GetMapping("/top10")
    @Operation(summary = "Récupérer le top 10 des idées (org)", description = "Retourne les 10 idées ayant les meilleurs scores dans l'organisation courante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Top 10 récupéré avec succès",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content)
    })
    public ResponseEntity<List<IdeaDTO>> getTop10Ideas(
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ideaService.getTop10IdeasInOrg(orgId));
    }
}
