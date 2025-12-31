package com.example.voteservice.Controller;

import com.example.voteservice.Model.Dto.VoteDto;
import com.example.voteservice.Model.enums.VoteType;
import com.example.voteservice.Service.VoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/votes")
public class VoteController {

    private final VoteService service;

    public VoteController(VoteService service) {
        this.service = service;
    }

    @PostMapping
    public VoteDto addVote(@RequestBody VoteDto dto) {
        return service.addVote(dto);
    }

    @GetMapping("/{id}")
    public VoteDto getVote(@PathVariable Long id) {
        return service.getVote(id);
    }

    @GetMapping("/byUser/{userId}")
    public List<VoteDto> byUser(@PathVariable Long userId) {
        return service.getVotesByUser(userId);
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

    @GetMapping("/count/byUser/{userId}")
    public long countByUser(@PathVariable Long userId) {
        return service.countVotesByUser(userId);
    }

// ===== HAS VOTED =====

    @GetMapping("/hasVoted")
    public boolean hasVoted(
            @RequestParam Long userId,
            @RequestParam Long ideaId) {
        return service.hasVoted(userId, ideaId);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public void deleteVote(@PathVariable Long id) {
        service.deleteVote(id);
    }
}
