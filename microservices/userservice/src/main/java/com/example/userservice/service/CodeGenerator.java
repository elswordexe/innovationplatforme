package com.example.userservice.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class CodeGenerator {
    private static final String ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private final SecureRandom random = new SecureRandom();

    public String generateCode(String prefix, int length) {
        StringBuilder sb = new StringBuilder();
        if (prefix != null && !prefix.isBlank()) {
            String p = normalizePrefix(prefix);
            sb.append(p);
            sb.append("-");
        }
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUM.charAt(random.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }

    private String normalizePrefix(String prefix) {
        String p = prefix.trim().toUpperCase();
        StringBuilder out = new StringBuilder();
        for (char c : p.toCharArray()) {
            if ((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
                out.append(c);
                if (out.length() >= 6) break;
            }
        }
        return out.toString();
    }
}
