package com.example.ideaservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${app.kafka.topics.notifications}")
    private String notificationsTopic;

    public void publish(NotificationEvent event) {
        try {
            kafkaTemplate.send(notificationsTopic, String.valueOf(event.getUserId()), event);
            log.info("Published NotificationEvent to topic {}: {}", notificationsTopic, event);
        } catch (Exception e) {
            log.error("Failed to publish NotificationEvent: {}", event, e);
        }
    }
}
