package com.example.bookmarkservice.Repository;

import com.example.bookmarkservice.Model.entities.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    List<Bookmark> findByUserId(Long userId);

    boolean existsByUserIdAndIdeaId(Long userId, Long ideaId);
}
