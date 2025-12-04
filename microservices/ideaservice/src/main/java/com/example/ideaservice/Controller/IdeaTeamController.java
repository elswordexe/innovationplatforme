package com.example.ideaservice.Controller;

import com.example.ideaservice.Exceptions.ResourceNotFoundException;
import com.example.ideaservice.Model.Dto.IdeaDTO;
import com.example.ideaservice.Model.Dto.team.TeamMemberDTO;
import com.example.ideaservice.Service.IdeaServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
@Tag(name = "Idea Team Management", description = "APIs pour la gestion des équipes des idées")
@CrossOrigin(origins = "*")
public class IdeaTeamController {
    private final IdeaServiceImpl ideaService;

    @PostMapping("/{id}/team/{userId}")
    @Operation(summary = "Ajouter un membre à l'équipe")
    public ResponseEntity<IdeaDTO> addTeamMember(
            @PathVariable Long id,
            @PathVariable Long userId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.addTeamMember(id, userId));
    }

    @DeleteMapping("/{id}/team/{userId}")
    @Operation(summary = "Retirer un membre de l'équipe")
    public ResponseEntity<IdeaDTO> removeTeamMember(
            @PathVariable Long id,
            @PathVariable Long userId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.removeTeamMember(id, userId));
    }

    @GetMapping("/{id}/team")
    @Operation(summary = "Récupérer l'équipe d'une idée")
    public ResponseEntity<List<Long>> getTeamMembers(@PathVariable Long id) throws ResourceNotFoundException {
        return ResponseEntity.ok(ideaService.getTeamMembers(id));
    }
}
