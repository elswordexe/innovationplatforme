import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface VoteDto {
  id?: number;
  ideaId: number;
  userId: number;
  voteType: 'UPVOTE' | 'DOWNVOTE';
  createdAt?: string;
}

export interface LikeDto {
  id?: number;
  ideaId: number;
  userId: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private baseUrl = 'http://localhost:8080/api/votes'; // Gateway API
  private likesUrl = 'http://localhost:8080/api/likes'; // Likes API
  private votesChanged = new ReplaySubject<void>(1);
  public votesChanged$ = this.votesChanged.asObservable();

  constructor(private http: HttpClient) {}

  myVotes(userId: number): Observable<VoteDto[]> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.get<VoteDto[]>(`${this.baseUrl}/me`, { headers });
  }

  addVote(vote: VoteDto, userId: number): Observable<VoteDto> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.post<VoteDto>(this.baseUrl, vote, { headers }).pipe(
      tap(() => this.votesChanged.next())
    );
  }

  updateVote(voteId: number, vote: VoteDto, userId: number): Observable<VoteDto> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.patch<VoteDto>(`${this.baseUrl}/${voteId}`, vote, { headers }).pipe(
      tap(() => this.votesChanged.next())
    );
  }

  deleteVote(voteId: number, userId: number): Observable<void> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.delete<void>(`${this.baseUrl}/${voteId}`, { headers }).pipe(
      tap(() => this.votesChanged.next())
    );
  }

  getVotesByIdea(ideaId: number): Observable<VoteDto[]> {
    return this.http.get<VoteDto[]>(`${this.baseUrl}/byIdea/${ideaId}`);
  }

  countVotesByIdea(ideaId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/byIdea/${ideaId}`);
  }

  hasVoted(ideaId: number, userId: number): Observable<boolean> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.get<boolean>(`${this.baseUrl}/hasVoted?ideaId=${ideaId}`, { headers });
  }

  // Like endpoints
  addLike(like: LikeDto, userId: number): Observable<LikeDto> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.post<LikeDto>(this.likesUrl, like, { headers }).pipe(
      tap(() => this.votesChanged.next())
    );
  }

  removeLike(ideaId: number, userId: number): Observable<void> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.delete<void>(`${this.likesUrl}/idea/${ideaId}`, { headers }).pipe(
      tap(() => this.votesChanged.next())
    );
  }

  getLikesByIdea(ideaId: number): Observable<LikeDto[]> {
    return this.http.get<LikeDto[]>(`${this.likesUrl}/byIdea/${ideaId}`);
  }

  countLikesByIdea(ideaId: number): Observable<number> {
    return this.http.get<number>(`${this.likesUrl}/count/byIdea/${ideaId}`);
  }

  hasLiked(ideaId: number, userId: number): Observable<boolean> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.get<boolean>(`${this.likesUrl}/hasLiked?ideaId=${ideaId}`, { headers });
  }
}
