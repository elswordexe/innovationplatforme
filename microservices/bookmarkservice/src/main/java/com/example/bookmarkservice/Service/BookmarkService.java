package com.example.bookmarkservice.Service;

import com.example.bookmarkservice.Model.Dto.BookmarkDto;

import java.util.List;

public interface BookmarkService {

    List<BookmarkDto> getBookmarksByUser(Long userId);

    BookmarkDto addBookmark(BookmarkDto dto, String actorName);

    void removeBookmark(Long bookmarkId, Long currentUserId);

    BookmarkDto updateBookmark(Long id, BookmarkDto dto, String actorName);

    long countBookmarksByIdea(Long ideaId);

    boolean hasBookmarked(Long userId, Long ideaId);
}
