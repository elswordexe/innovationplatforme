package com.example.teamservice.Model.Dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamAssignmentUpdateRequest {
    private Long ideaId;
    private Long userId;
    private Long assignedById;
    private Date assignmentDate;
    private String role;
}
