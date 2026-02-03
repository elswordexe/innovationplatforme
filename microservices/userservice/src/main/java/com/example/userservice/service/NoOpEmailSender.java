package com.example.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NoOpEmailSender implements EmailSender {
    @Override
    public void send(String to, String subject, String body) {
        log.info("[Email NO-OP] To: {} | Subject: {} | Body: {}", to, subject, body);
    }
}
