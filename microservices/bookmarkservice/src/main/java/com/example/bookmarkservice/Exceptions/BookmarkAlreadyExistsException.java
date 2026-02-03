package com.example.bookmarkservice.Exceptions;

public class BookmarkAlreadyExistsException extends RuntimeException {
    public BookmarkAlreadyExistsException(String message) {
        super(message);
    }
}
