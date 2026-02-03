package com.example.userservice.controllers;

import com.example.userservice.dto.UserCreateRequest;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserUpdateRequest;
import com.example.userservice.exceptions.ResourceNotFoundException;
import com.example.userservice.service.UserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User CRUD", description = "APIs pour les opérations utilisateurs")
public class UserController {

    private final UserServiceImpl userService;

    @PostMapping
    @Operation(summary = "Créer un utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Utilisateur créé",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content)
    })
    public ResponseEntity<UserDTO> create(@Valid @RequestBody UserCreateRequest request) {
        UserDTO created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un utilisateur par ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur trouvé",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content)
    })
    public ResponseEntity<UserDTO> getById(@Parameter(description = "ID de l'utilisateur", required = true, example = "1")
                                           @PathVariable Long id) throws ResourceNotFoundException {
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping("/{id}/name")
    @Operation(summary = "Récupérer le nom complet d'un utilisateur par ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Nom trouvé",
                    content = @Content(mediaType = "text/plain")),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content)
    })
    public ResponseEntity<String> getUserNameById(@Parameter(description = "ID de l'utilisateur", required = true, example = "1")
                                                 @PathVariable Long id) throws ResourceNotFoundException {
        log.info("Fetching user name for userId: {}", id);
        String userName = userService.getUserNameById(id);
        log.info("Found user name: {} for userId: {}", userName, id);
        return ResponseEntity.ok(userName);
    }

    @GetMapping
    @Operation(summary = "Lister tous les utilisateurs")
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur mis à jour",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content)
    })
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) throws ResourceNotFoundException {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Utilisateur supprimé", content = @Content),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content)
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) throws ResourceNotFoundException {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-email")
    @Operation(summary = "Récupérer un utilisateur par email")
    public ResponseEntity<UserDTO> getByEmail(@RequestParam String email) throws ResourceNotFoundException {
        return ResponseEntity.ok(userService.getByEmail(email));
    }

    @GetMapping("/search")
    @Operation(summary = "Recherchercher des utilisateurs par nom")
    public ResponseEntity<List<UserDTO>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(userService.searchByName(keyword));
    }

    @GetMapping("/by-role/{role}")
    @Operation(summary = "Lister les utilisateurs par rôle")
    public ResponseEntity<List<UserDTO>> getByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getByRole(role));
    }

    // Profile picture management endpoints
    @PostMapping("/{id}/profile-picture")
    @Operation(summary = "Uploader une photo de profil")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Photo de profil uploadée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content),
            @ApiResponse(responseCode = "400", description = "Fichier invalide", content = @Content)
    })
    public ResponseEntity<UserDTO> uploadProfilePicture(
            @Parameter(description = "ID de l'utilisateur", required = true) @PathVariable Long id,
            @Parameter(description = "Fichier image", required = true) @RequestParam("file") MultipartFile file) 
            throws ResourceNotFoundException {
        UserDTO updated = userService.uploadProfilePicture(id, file);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/profile-picture")
    @Operation(summary = "Mettre à jour l'URL de la photo de profil")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL de la photo de profil mise à jour",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content)
    })
    public ResponseEntity<UserDTO> updateProfilePicture(
            @Parameter(description = "ID de l'utilisateur", required = true) @PathVariable Long id,
            @RequestBody String profilePictureUrl) throws ResourceNotFoundException {
        UserDTO updated = userService.updateProfilePicture(id, profilePictureUrl);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/profile-picture")
    @Operation(summary = "Récupérer la photo de profil d'un utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Photo de profil trouvée",
                    content = @Content(mediaType = "application/octet-stream")),
            @ApiResponse(responseCode = "404", description = "Photo de profil non trouvée", content = @Content)
    })
    public ResponseEntity<ByteArrayResource> getProfilePicture(@PathVariable Long id) throws ResourceNotFoundException {
        byte[] profilePicture = userService.getProfilePicture(id);
        
        if (profilePicture.length == 0) {
            // Return empty response if it's a URL (client should fetch it)
            return ResponseEntity.ok().build();
        }
        
        ByteArrayResource resource = new ByteArrayResource(profilePicture);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // Adjust based on actual image type
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=profile-picture.jpg")
                .body(resource);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("User Service is running!");
    }
}

