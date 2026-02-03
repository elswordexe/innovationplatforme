package com.example.bookmarkservice.mapper;

import com.example.bookmarkservice.Model.Dto.BookmarkDto;
import com.example.bookmarkservice.Model.entities.Bookmark;

public interface BookmarkMapper {

    BookmarkDto toDto(Bookmark bookmark);

    Bookmark toEntity(BookmarkDto dto);
}
