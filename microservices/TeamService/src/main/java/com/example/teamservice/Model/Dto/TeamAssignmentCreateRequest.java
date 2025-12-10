package com.example.teamservice.Model.Dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamAssignmentCreateRequest {
    @NotNull
    private Long ideaId;
    @NotNull
    private Long userId;
    @NotNull
    private Long assignedById;
    @NotNull
    private String role;
}
