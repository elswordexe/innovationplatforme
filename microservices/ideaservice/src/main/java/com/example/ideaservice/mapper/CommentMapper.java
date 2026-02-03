package com.example.ideaservice.mapper;

import com.example.ideaservice.Model.Dto.CommentDTO;
import com.example.ideaservice.Model.entities.Comment;

import java.util.List;

public interface CommentMapper {
    CommentDTO toDTO(Comment comment);
    List<CommentDTO> toDTOList(List<Comment> comments);
    Comment toEntity(CommentDTO dto);
}
