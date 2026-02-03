import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface BookmarkDto {
  id?: number;
  ideaId: number;
  userId: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private baseUrl = 'http://localhost:8080/api/bookmarks'; // Gateway API
  private bookmarksChanged = new ReplaySubject<void>(1);
  public bookmarksChanged$ = this.bookmarksChanged.asObservable();

  constructor(private http: HttpClient) {}

  getMyBookmarks(userId: number): Observable<BookmarkDto[]> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.get<BookmarkDto[]>(`${this.baseUrl}/me`, { headers });
  }

  addBookmark(bookmark: BookmarkDto, userId: number): Observable<BookmarkDto> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.post<BookmarkDto>(this.baseUrl, bookmark, { headers }).pipe(
      tap(() => this.bookmarksChanged.next())
    );
  }

  updateBookmark(bookmarkId: number, bookmark: BookmarkDto, userId: number): Observable<BookmarkDto> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.patch<BookmarkDto>(`${this.baseUrl}/${bookmarkId}`, bookmark, { headers }).pipe(
      tap(() => this.bookmarksChanged.next())
    );
  }

  removeBookmark(bookmarkId: number, userId: number): Observable<void> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.delete<void>(`${this.baseUrl}/${bookmarkId}`, { headers }).pipe(
      tap(() => this.bookmarksChanged.next())
    );
  }

  getBookmarksByIdea(ideaId: number): Observable<BookmarkDto[]> {
    return this.http.get<BookmarkDto[]>(`${this.baseUrl}/byIdea/${ideaId}`);
  }

  countBookmarksByIdea(ideaId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/byIdea/${ideaId}`);
  }

  hasBookmarked(ideaId: number, userId: number): Observable<boolean> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.get<boolean>(`${this.baseUrl}/hasBookmarked?ideaId=${ideaId}`, { headers });
  }
}
