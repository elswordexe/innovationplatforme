package com.example.notificationservice.controller;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repository;

    @GetMapping
    public Page<Notification> listByUser(@RequestParam Long userId,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> unreadCount(@RequestParam Long userId) {
        long count = repository.countByUserIdAndReadFalse(userId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        Optional<Notification> existing = repository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Notification n = existing.get();
        n.setRead(true);
        if (n.getCreatedAt() == null) {
            n.setCreatedAt(Instant.now());
        }
        repository.save(n);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
