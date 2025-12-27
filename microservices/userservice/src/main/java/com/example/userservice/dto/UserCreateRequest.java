package com.example.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreateRequest {
    @NotBlank
    private String fullname;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    @Size(min = 6)
    private String password;
    @NotBlank
    private String role;
}

