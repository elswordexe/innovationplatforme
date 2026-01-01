package com.example.bookmarkservice.Service;

import com.example.bookmarkservice.Exceptions.BookmarkAlreadyExistsException;
import com.example.bookmarkservice.Exceptions.BookmarkNotFoundException;
import com.example.bookmarkservice.Model.Dto.BookmarkDto;
import com.example.bookmarkservice.Model.entities.Bookmark;
import com.example.bookmarkservice.Repository.BookmarkRepository;
import com.example.bookmarkservice.mapper.BookmarkMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository repository;
    private final BookmarkMapper mapper;

    public BookmarkServiceImpl(BookmarkRepository repository, BookmarkMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public List<BookmarkDto> getBookmarksByUser(Long userId) {
        return repository.findByUserId(userId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public BookmarkDto addBookmark(BookmarkDto dto) {

        if (repository.existsByUserIdAndIdeaId(dto.getUserId(), dto.getIdeaId())) {
            throw new BookmarkAlreadyExistsException("Idea already bookmarked");
        }

        Bookmark saved = repository.save(mapper.toEntity(dto));
        return mapper.toDto(saved);
    }

    @Override
    public void removeBookmark(Long bookmarkId) {
        if (!repository.existsById(bookmarkId)) {
            throw new BookmarkNotFoundException("Bookmark not found");
        }
        repository.deleteById(bookmarkId);
    }
}
