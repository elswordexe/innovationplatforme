package com.example.userservice.dto;

import jakarta.validation.constraints.Email;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String fullname;
    @Email
    private String email;
    private String password;
    private String role;
}

