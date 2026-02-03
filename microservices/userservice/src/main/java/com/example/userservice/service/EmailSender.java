package com.example.userservice.service;

public interface EmailSender {
    void send(String to, String subject, String body);
}
