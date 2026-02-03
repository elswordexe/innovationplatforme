package com.example.bookmarkservice.Controller;

import com.example.bookmarkservice.Model.Dto.BookmarkDto;
import com.example.bookmarkservice.Service.BookmarkService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService service;

    public BookmarkController(BookmarkService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public List<BookmarkDto> getMyBookmarks(@RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        return service.getBookmarksByUser(currentUserId);
    }

    @GetMapping("/count/byIdea/{ideaId}")
    public long countByIdea(@PathVariable Long ideaId) {
        return service.countBookmarksByIdea(ideaId);
    }

    @GetMapping("/hasBookmarked")
    public boolean hasBookmarked(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestParam Long ideaId) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        return service.hasBookmarked(currentUserId, ideaId);
    }

    @PostMapping
    public BookmarkDto add(@RequestBody BookmarkDto dto,
                           @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                           @RequestHeader(value = "X-User-Name", required = false) String actorName) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        // Force userId to current user regardless of payload
        dto.setUserId(currentUserId);
        return service.addBookmark(dto, actorName);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id,
                       @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        service.removeBookmark(id, currentUserId);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public BookmarkDto update(@PathVariable Long id,
                             @RequestBody BookmarkDto dto,
                             @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                             @RequestHeader(value = "X-User-Name", required = false) String actorName) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        dto.setUserId(currentUserId);
        return service.updateBookmark(id, dto, actorName);
    }

    @PatchMapping("/{id}")
    public BookmarkDto patch(@PathVariable Long id,
                            @RequestBody BookmarkDto dto,
                            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                            @RequestHeader(value = "X-User-Name", required = false) String actorName) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        dto.setUserId(currentUserId);
        return service.updateBookmark(id, dto, actorName);
    }
}
