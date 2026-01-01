package com.example.bookmarkservice.Service;

import com.example.bookmarkservice.Model.Dto.BookmarkDto;

import java.util.List;

public interface BookmarkService {

    List<BookmarkDto> getBookmarksByUser(Long userId);

    BookmarkDto addBookmark(BookmarkDto dto);

    void removeBookmark(Long bookmarkId);
}
