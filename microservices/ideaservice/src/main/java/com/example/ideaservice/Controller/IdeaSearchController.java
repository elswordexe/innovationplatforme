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
@CrossOrigin(origins = "*")
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
            @PathVariable IdeaStatus status) {
        return ResponseEntity.ok(ideaService.getIdeasByStatus(status));
    }

    @GetMapping("/creator/{creatorId}")
    @Operation(summary = "Récupérer les idées par créateur", description = "Retourne toutes les idées créées par un utilisateur spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Idées récupérées avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class)))
    })
    public ResponseEntity<List<IdeaDTO>> getIdeasByCreator(
            @Parameter(description = "ID du créateur", required = true, example = "1")
            @PathVariable Long creatorId) {
        return ResponseEntity.ok(ideaService.getIdeasByCreator(creatorId));
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
        return ResponseEntity.ok(ideaService.getIdeasByOrganization(organizationId));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des idées", description = "Recherche des idées par mot-clé dans le titre ou la description")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recherche effectuée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class)))
    })
    public ResponseEntity<List<IdeaDTO>> searchIdeas(
            @Parameter(description = "Mot-clé de recherche", required = true, example = "innovation")
            @RequestParam String keyword){
        return ResponseEntity.ok(ideaService.searchIdeas(keyword));
    }

    @GetMapping("/top10")
    @Operation(summary = "Récupérer le top 10 des idées", description = "Retourne les 10 idées ayant les meilleurs scores")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Top 10 récupéré avec succès",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<List<IdeaDTO>> getTop10Ideas() {
        return ResponseEntity.ok(ideaService.getTop10Ideas());
    }
}
