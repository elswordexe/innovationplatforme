package com.example.teamservice.Model.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "team_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long ideaId;
    private Long userId;
    private Long assignedById;

    @Temporal(TemporalType.TIMESTAMP)
    private Date assignmentDate;

    private String role;
}
