package com.example.bookmarkservice.Controller;

import com.example.bookmarkservice.Model.Dto.BookmarkDto;
import com.example.bookmarkservice.Service.BookmarkService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "http://localhost:4200")
public class BookmarkController {

    private final BookmarkService service;

    public BookmarkController(BookmarkService service) {
        this.service = service;
    }

    @GetMapping("/user/{userId}")
    public List<BookmarkDto> getUserBookmarks(@PathVariable Long userId) {
        return service.getBookmarksByUser(userId);
    }

    @PostMapping
    public BookmarkDto add(@RequestBody BookmarkDto dto, @RequestHeader(value = "X-User-Name", required = false) String actorName) {
        return service.addBookmark(dto, actorName);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.removeBookmark(id);
    }
}
