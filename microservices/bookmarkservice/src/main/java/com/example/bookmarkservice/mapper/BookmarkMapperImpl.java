package com.example.bookmarkservice.mapper;

import com.example.bookmarkservice.Model.Dto.BookmarkDto;
import com.example.bookmarkservice.Model.entities.Bookmark;
import org.springframework.stereotype.Component;

@Component
public class BookmarkMapperImpl implements BookmarkMapper {

    @Override
    public BookmarkDto toDto(Bookmark bookmark) {
        BookmarkDto dto = new BookmarkDto();
        dto.setId(bookmark.getId());
        dto.setUserId(bookmark.getUserId());
        dto.setIdeaId(bookmark.getIdeaId());
        return dto;
    }

    @Override
    public Bookmark toEntity(BookmarkDto dto) {
        Bookmark bookmark = new Bookmark();
        bookmark.setId(dto.getId());
        bookmark.setUserId(dto.getUserId());
        bookmark.setIdeaId(dto.getIdeaId());
        return bookmark;
    }
}
