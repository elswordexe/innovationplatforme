package com.example.ideaservice.Model.Dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {
    private Long id;
    private Long ideaId;
    private Long authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
    private Integer likes;
    private Boolean isLiked;
    private Long organizationId;
}
