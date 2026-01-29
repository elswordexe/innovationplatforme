import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {IdeaFrontend} from '../features/dashb/dashb';

export interface IdeaBackend {
  id: number;
  title: string;
  description: string;
  creatorId: number;
  creatorName: string | null;
  creationDate: string;
  status: string;
  totalScore: number;
  voteCount: number;
  isInTop10: boolean;
}

interface IdeaCreateRequest {
  title: string;
  description: string;
  category: string;
}


@Injectable({
  providedIn: 'root'
})
export class IdeaService {

  private baseUrl = 'http://localhost:8082/api/ideas'; // ton endpoint Spring Boot

  constructor(private http: HttpClient) {}

  getAllIdeas(): Observable<IdeaBackend[]> {
    return this.http.get<IdeaBackend[]>(this.baseUrl);
  }

  getTopIdeas(): Observable<IdeaBackend[]> {
    return this.http.get<IdeaBackend[]>(`${this.baseUrl}/top10`);
  }

  // Créer une nouvelle idée
  createIdea(request: Partial<IdeaFrontend>, userId?: number): Observable<IdeaFrontend> {
    const headers = new HttpHeaders({
      'X-User-Id': userId ? userId.toString() : '1' // toujours une string
    });

    return this.http.post<IdeaFrontend>(this.baseUrl, request, { headers });
  }

  // Par ID (si besoin)
  getIdeaById(id: number): Observable<IdeaBackend> {
    return this.http.get<IdeaBackend>(`${this.baseUrl}/${id}`);
  }
}
