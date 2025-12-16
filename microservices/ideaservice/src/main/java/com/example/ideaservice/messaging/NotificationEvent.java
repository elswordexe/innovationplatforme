package com.example.ideaservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private Long userId;
    private String type; // e.g., IDEA_CREATED, TEAM_ASSIGNED
    private String title;
    private String message;
    private Instant createdAt;
}
