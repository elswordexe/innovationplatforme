package com.example.ideaservice.Controller;

import com.example.ideaservice.Model.Dto.CommentDTO;
import com.example.ideaservice.Service.CommentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
@Tag(name = "Comment Operations", description = "APIs pour la gestion des commentaires")
public class CommentController {

    private final CommentServiceImpl commentService;

    @PostMapping("/{ideaId}/comments")
    @Operation(summary = "Ajouter un commentaire", description = "Permet d'ajouter un nouveau commentaire à une idée")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Commentaire créé avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CommentDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content)
    })
    public ResponseEntity<CommentDTO> addComment(
            @Parameter(description = "ID de l'idée", required = true, example = "1")
            @PathVariable Long ideaId,
            @RequestBody CommentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long orgId) {

        if (userId == null || orgId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CommentDTO createdComment = commentService.createComment(
                ideaId,
                request.getContent(),
                userId,
                userName != null ? userName : "Unknown",
                orgId
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @GetMapping("/{ideaId}/comments")
    @Operation(summary = "Récupérer les commentaires d'une idée", description = "Retourne tous les commentaires pour une idée donnée")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Commentaires récupérés avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class)))
    })
    public ResponseEntity<List<CommentDTO>> getCommentsByIdeaId(
            @Parameter(description = "ID de l'idée", required = true, example = "1")
            @PathVariable Long ideaId) {
        List<CommentDTO> comments = commentService.getCommentsByIdeaId(ideaId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/comments/{commentId}")
    @Operation(summary = "Récupérer un commentaire par ID", description = "Retourne les détails d'un commentaire spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Commentaire trouvé",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CommentDTO.class))),
            @ApiResponse(responseCode = "404", description = "Commentaire non trouvé", content = @Content)
    })
    public ResponseEntity<CommentDTO> getCommentById(
            @Parameter(description = "ID du commentaire", required = true, example = "1")
            @PathVariable Long commentId) {
        CommentDTO comment = commentService.getCommentById(commentId);
        return ResponseEntity.ok(comment);
    }

    @PostMapping("/comments/{commentId}/like")
    @Operation(summary = "Aimer/Désaimer un commentaire", description = "Bascule le statut de like pour un commentaire")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Like togglé avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CommentDTO.class))),
            @ApiResponse(responseCode = "404", description = "Commentaire non trouvé", content = @Content),
            @ApiResponse(responseCode = "401", description = "En-têtes manquants", content = @Content)
    })
    public ResponseEntity<CommentDTO> toggleCommentLike(
            @Parameter(description = "ID du commentaire", required = true, example = "1")
            @PathVariable Long commentId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CommentDTO updatedComment = commentService.toggleCommentLike(commentId, userId);
        return ResponseEntity.ok(updatedComment);
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Supprimer un commentaire", description = "Supprime un commentaire existant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Commentaire supprimé avec succès", content = @Content),
            @ApiResponse(responseCode = "404", description = "Commentaire non trouvé", content = @Content)
    })
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "ID du commentaire", required = true, example = "1")
            @PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    // Request DTO for creating comments
    public static class CommentRequest {
        private String content;

        public CommentRequest() {}

        public CommentRequest(String content) {
            this.content = content;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
