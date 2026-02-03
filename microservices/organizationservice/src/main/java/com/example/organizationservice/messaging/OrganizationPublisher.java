package com.example.organizationservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrganizationPublisher {

    private final KafkaTemplate<String, OrganizationEvent> kafkaTemplate;

    @Value("${app.kafka.topics.organizations}")
    private String organizationsTopic;

    public void publish(OrganizationEvent event) {
        try {
            kafkaTemplate.send(organizationsTopic, String.valueOf(event.getOrganizationId()), event);
            log.info("Published OrganizationEvent to topic {}: {}", organizationsTopic, event);
        } catch (Exception e) {
            log.error("Failed to publish OrganizationEvent: {}", event, e);
        }
    }
}
