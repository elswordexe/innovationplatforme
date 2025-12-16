package com.example.teamservice.messaging;

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
    private String type; // e.g., TEAM_ASSIGNED
    private String title;
    private String message;
    private Instant createdAt;
}
