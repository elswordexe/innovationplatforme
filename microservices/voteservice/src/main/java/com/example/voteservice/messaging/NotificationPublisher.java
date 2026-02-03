package com.example.voteservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${app.kafka.topics.notifications}")
    private String notificationsTopic;

    public void publish(String key, NotificationEvent event) {
        try {
            kafkaTemplate.send(notificationsTopic, key, event);
            log.info("[VoteService] Published notification event: key={}, type={}, msg={}", key, event.getType(), event.getMessage());
        } catch (Exception e) {
            log.error("[VoteService] Failed to publish notification event: {}", e.getMessage(), e);
        }
    }
}
