package com.example.ideaservice.Service;

import com.example.ideaservice.Model.Dto.CommentDTO;

import java.util.List;

public interface CommentService {
    CommentDTO createComment(Long ideaId, String content, Long authorId, String authorName, Long organizationId);
    List<CommentDTO> getCommentsByIdeaId(Long ideaId);
    CommentDTO getCommentById(Long commentId);
    void deleteComment(Long commentId);
    CommentDTO toggleCommentLike(Long commentId, Long userId);
}
