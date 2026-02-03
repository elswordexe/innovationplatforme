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

    // In a microservices architecture, we store foreign keys (IDs) instead of direct entity references
    private Long ideaId;
    private Long userId;        // Team member assigned
    private Long assignedById;  // Who assigned the member

    @Temporal(TemporalType.TIMESTAMP)
    private Date assignmentDate;

    private String role;
}
