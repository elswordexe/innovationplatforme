package com.example.bookmarkservice.Service;

import com.example.bookmarkservice.Exceptions.BookmarkAlreadyExistsException;
import com.example.bookmarkservice.Exceptions.BookmarkNotFoundException;
import com.example.bookmarkservice.Model.Dto.BookmarkDto;
import com.example.bookmarkservice.Model.entities.Bookmark;
import com.example.bookmarkservice.Repository.BookmarkRepository;
import com.example.bookmarkservice.client.IdeaClient;
import com.example.bookmarkservice.mapper.BookmarkMapper;
import com.example.bookmarkservice.messaging.NotificationEvent;
import com.example.bookmarkservice.messaging.NotificationPublisher;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository repository;
    private final BookmarkMapper mapper;
    private final NotificationPublisher notificationPublisher;
    private final IdeaClient ideaClient;

    public BookmarkServiceImpl(BookmarkRepository repository,
                               BookmarkMapper mapper,
                               NotificationPublisher notificationPublisher,
                               IdeaClient ideaClient) {
        this.repository = repository;
        this.mapper = mapper;
        this.notificationPublisher = notificationPublisher;
        this.ideaClient = ideaClient;
    }

    @Override
    public List<BookmarkDto> getBookmarksByUser(Long userId) {
        return repository.findByUserId(userId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public BookmarkDto addBookmark(BookmarkDto dto, String actorName) {

        if (repository.existsByUserIdAndIdeaId(dto.getUserId(), dto.getIdeaId())) {
            throw new BookmarkAlreadyExistsException("Idea already bookmarked");
        }

        Bookmark saved = repository.save(mapper.toEntity(dto));

        // Build and publish notification (only on add)
        long total = repository.countByIdeaId(dto.getIdeaId());
        Long ownerId = ideaClient.getIdeaOwnerId(dto.getIdeaId());
        if (ownerId != null) {
            String msg = buildBookmarkMessage(actorName, total);
            NotificationEvent event = NotificationEvent.builder()
                    .userId(ownerId)
                    .type("BOOKMARK_ACTIVITY")
                    .title("Nouveau bookmark")
                    .message(msg)
                    .createdAt(Instant.now())
                    .build();
            notificationPublisher.publish(String.valueOf(dto.getIdeaId()), event);
        }

        return mapper.toDto(saved);
    }

    private String buildBookmarkMessage(String actorName, long total) {
        String name = (actorName == null || actorName.isBlank()) ? "Quelqu'un" : actorName;
        if (total <= 1) {
            return name + " a bookmarké votre idée";
        }
        long others = total - 1;
        return name + " et " + others + " autre" + (others > 1 ? "s" : "") + " ont bookmarké votre idée";
    }

    @Override
    public void removeBookmark(Long bookmarkId) {
        if (!repository.existsById(bookmarkId)) {
            throw new BookmarkNotFoundException("Bookmark not found");
        }
        repository.deleteById(bookmarkId);
        // No notification on remove (per requirements)
    }
}
