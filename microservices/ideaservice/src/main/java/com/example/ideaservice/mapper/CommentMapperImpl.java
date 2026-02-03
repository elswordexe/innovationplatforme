package com.example.ideaservice.mapper;

import com.example.ideaservice.Model.Dto.CommentDTO;
import com.example.ideaservice.Model.entities.Comment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CommentMapperImpl implements CommentMapper {

    @Override
    public CommentDTO toDTO(Comment comment) {
        if (comment == null) {
            return null;
        }

        return CommentDTO.builder()
                .id(comment.getId())
                .ideaId(comment.getIdeaId())
                .authorId(comment.getAuthorId())
                .authorName(comment.getAuthorName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .likes(comment.getLikes())
                .isLiked(comment.getIsLiked())
                .organizationId(comment.getOrganizationId())
                .build();
    }

    @Override
    public List<CommentDTO> toDTOList(List<Comment> comments) {
        if (comments == null) {
            return null;
        }

        return comments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Comment toEntity(CommentDTO dto) {
        if (dto == null) {
            return null;
        }

        return Comment.builder()
                .id(dto.getId())
                .ideaId(dto.getIdeaId())
                .authorId(dto.getAuthorId())
                .authorName(dto.getAuthorName())
                .content(dto.getContent())
                .createdAt(dto.getCreatedAt())
                .likes(dto.getLikes())
                .isLiked(dto.getIsLiked())
                .organizationId(dto.getOrganizationId())
                .build();
    }
}
