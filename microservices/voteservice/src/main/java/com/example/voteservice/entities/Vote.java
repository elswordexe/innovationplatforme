package com.example.voteservice.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ideaId;
    private Long userId;

    private boolean likeVote;
    private String comment;
}
