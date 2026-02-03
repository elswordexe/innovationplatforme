package com.example.ideaservice.Service;

import com.example.ideaservice.Model.Dto.CommentDTO;
import com.example.ideaservice.Model.entities.Comment;
import com.example.ideaservice.Repository.CommentRepository;
import com.example.ideaservice.mapper.CommentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

    @Override
    public CommentDTO createComment(Long ideaId, String content, Long authorId, String authorName, Long organizationId) {
        log.info("Creating comment for idea {} by author {}", ideaId, authorId);

        Comment comment = Comment.builder()
                .ideaId(ideaId)
                .content(content)
                .authorId(authorId)
                .authorName(authorName)
                .organizationId(organizationId)
                .createdAt(LocalDateTime.now())
                .likes(0)
                .isLiked(false)
                .build();

        Comment saved = commentRepository.save(comment);
        return commentMapper.toDTO(saved);
    }

    @Override
    public List<CommentDTO> getCommentsByIdeaId(Long ideaId) {
        log.info("Fetching comments for idea {}", ideaId);
        return commentRepository.findByIdeaIdOrderByCreatedAtDesc(ideaId)
                .stream()
                .map(commentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CommentDTO getCommentById(Long commentId) {
        log.info("Fetching comment {}", commentId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        return commentMapper.toDTO(comment);
    }

    @Override
    public void deleteComment(Long commentId) {
        log.info("Deleting comment {}", commentId);
        commentRepository.deleteById(commentId);
    }

    @Override
    public CommentDTO toggleCommentLike(Long commentId, Long userId) {
        log.info("Toggling like for comment {} by user {}", commentId, userId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Toggle like
        if (comment.getIsLiked() == null || !comment.getIsLiked()) {
            comment.setIsLiked(true);
            comment.setLikes(comment.getLikes() + 1);
        } else {
            comment.setIsLiked(false);
            comment.setLikes(comment.getLikes() - 1);
        }

        Comment updated = commentRepository.save(comment);
        return commentMapper.toDTO(updated);
    }
}
