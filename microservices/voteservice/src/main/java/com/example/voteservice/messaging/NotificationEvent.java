package com.example.voteservice.messaging;

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
    private Long userId; // destinataire: owner de l'idée
    private String type; 
    private String title;
    private String message;
    private Instant createdAt;
}
