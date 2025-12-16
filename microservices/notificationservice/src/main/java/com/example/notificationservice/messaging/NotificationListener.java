package com.example.notificationservice.messaging;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationListener {

    private final NotificationRepository repository;

    @KafkaListener(topics = "${app.kafka.topics.notifications}", groupId = "${spring.kafka.consumer.group-id}")
    public void onMessage(NotificationEvent event) {
        try {
            if (event.getCreatedAt() == null) {
                event.setCreatedAt(Instant.now());
            }
            Notification notification = Notification.builder()
                    .userId(event.getUserId())
                    .type(event.getType())
                    .title(event.getTitle())
                    .message(event.getMessage())
                    .createdAt(event.getCreatedAt())
                    .read(false)
                    .build();
            repository.save(notification);
            log.info("Saved notification for user {} of type {}", event.getUserId(), event.getType());
        } catch (Exception ex) {
            log.error("Failed to process notification event: {}", event, ex);
            throw ex;
        }
    }
}
