package com.example.voteservice.Controller;

import com.example.voteservice.Model.Dto.FeedbackDto;
import com.example.voteservice.Service.FeedbackService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedbacks")
public class FeedbackController {

    private final FeedbackService service;

    public FeedbackController(FeedbackService service) {
        this.service = service;
    }

    // ➕ Ajouter un feedback
    @PostMapping
    public FeedbackDto addFeedback(@RequestBody FeedbackDto dto) {
        return service.addFeedback(dto);
    }

    // 🔍 Récupérer un feedback par id
    @GetMapping("/{id}")
    public FeedbackDto getFeedback(@PathVariable Long id) {
        return service.getFeedback(id);
    }

    // 📌 Tous les feedbacks d'une idée
    @GetMapping("/byIdea/{ideaId}")
    public List<FeedbackDto> getByIdea(@PathVariable Long ideaId) {
        return service.getFeedbacksByIdea(ideaId);
    }

    // ===== COUNT =====

    @GetMapping("/count/byIdea/{ideaId}")
    public long countByIdea(@PathVariable Long ideaId) {
        return service.countFeedbacksByIdea(ideaId);
    }

    @GetMapping("/count/byUser/{userId}")
    public long countByUser(@PathVariable Long userId) {
        return service.countFeedbacksByUser(userId);
    }

    @DeleteMapping("/{id}")
    public void deleteFeedback(@PathVariable Long id) {
        service.deleteFeedback(id);
    }
}
