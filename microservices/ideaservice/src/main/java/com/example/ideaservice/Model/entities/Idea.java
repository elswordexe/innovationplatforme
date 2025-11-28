package com.example.ideaservice.Model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String status;
    private Long userId;
}
