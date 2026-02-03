package com.example.ideaservice.Model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ideaId;
    private Long authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
    private Integer likes = 0;
    private Boolean isLiked = false;
    private Long organizationId;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (likes == null) {
            likes = 0;
        }
        if (isLiked == null) {
            isLiked = false;
        }
    }
}
