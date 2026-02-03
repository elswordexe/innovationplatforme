package com.example.voteservice.Controller;

import com.example.voteservice.Model.Dto.VoteDto;
import com.example.voteservice.Model.enums.VoteType;
import com.example.voteservice.Service.VoteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/votes")
public class VoteController {

    private final VoteService service;

    public VoteController(VoteService service) {
        this.service = service;
    }

    @PostMapping
    public VoteDto addVote(@RequestBody VoteDto dto,
                           @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                           @RequestHeader(value = "X-User-Name", required = false) String actorName) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        dto.setUserId(currentUserId);
        return service.addVote(dto, actorName);
    }

    @GetMapping("/{id}")
    public VoteDto getVote(@PathVariable Long id) {
        return service.getVote(id);
    }

    @GetMapping("/me")
    public List<VoteDto> myVotes(@RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        return service.getVotesByUser(currentUserId);
    }

    @GetMapping("/byIdea/{ideaId}")
    public List<VoteDto> byIdea(@PathVariable Long ideaId) {
        return service.getVotesByIdea(ideaId);
    }

    // ===== COUNT =====

    @GetMapping("/count/byIdea/{ideaId}")
    public long countByIdea(@PathVariable Long ideaId) {
        return service.countVotesByIdea(ideaId);
    }

    @GetMapping("/count/byIdea/{ideaId}/type/{type}")
    public long countByIdeaAndType(
            @PathVariable Long ideaId,
            @PathVariable VoteType type) {
        return service.countVotesByIdeaAndType(ideaId, type);
    }

    @GetMapping("/count/me")
    public long countByCurrentUser(@RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        return service.countVotesByUser(currentUserId);
    }

    // ===== HAS VOTED =====

    @GetMapping("/hasVoted")
    public boolean hasVoted(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestParam Long ideaId) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        return service.hasVoted(currentUserId, ideaId);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public void deleteVote(@PathVariable Long id,
                           @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        service.deleteVote(id, currentUserId);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public VoteDto updateVote(@PathVariable Long id,
                             @RequestBody VoteDto dto,
                             @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                             @RequestHeader(value = "X-User-Name", required = false) String actorName) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        dto.setUserId(currentUserId);
        return service.updateVote(id, dto, actorName);
    }

    @PatchMapping("/{id}")
    public VoteDto patchVote(@PathVariable Long id,
                            @RequestBody VoteDto dto,
                            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                            @RequestHeader(value = "X-User-Name", required = false) String actorName) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        dto.setUserId(currentUserId);
        return service.updateVote(id, dto, actorName);
    }
}
