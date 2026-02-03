import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
  likeCount?: number;
  isInTop10: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  data: string; // Base64 encoded image data
  uploadedAt: string;
}

export interface Comment {
  id: number;
  ideaId: number;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
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

  private baseUrl = 'http://localhost:8080/api/ideas'; // Gateway API

  constructor(private http: HttpClient) {}

  getAllIdeas(): Observable<IdeaBackend[]> {
    return this.http.get<IdeaBackend[]>(this.baseUrl);
  }

  getIdeasByOrganization(organizationId: number): Observable<IdeaBackend[]> {
    const headers = new HttpHeaders({
      'X-Tenant-Id': organizationId.toString()
    });
    return this.http.get<IdeaBackend[]>(`${this.baseUrl}/organization/${organizationId}`, { headers });
  }

  getIdeasForCurrentUser(): Observable<IdeaBackend[]> {
    const tenantId = localStorage.getItem('tenantId');
    const userId = localStorage.getItem('userId');
    
    if (tenantId && tenantId !== '1') {
      // User belongs to an organization, filter by organization
      return this.getIdeasByOrganization(parseInt(tenantId));
    } else {
      // Individual user or default tenant, return empty array
      return of([]);
    }
  }

  getTopIdeas(): Observable<IdeaBackend[]> {
    return this.http.get<IdeaBackend[]>(`${this.baseUrl}/top10`);
  }

  getIdeasByStatus(status: string): Observable<IdeaBackend[]> {
    const headers = new HttpHeaders({
      'X-Tenant-Id': localStorage.getItem('tenantId') || '1'
    });
    return this.http.get<IdeaBackend[]>(`${this.baseUrl}/status/${status}`, { headers });
  }

  // Créer une nouvelle idée avec image (en base64)
  createIdeaWithImage(request: Partial<IdeaFrontend>, userId?: number): Observable<IdeaFrontend> {
    const headers = new HttpHeaders({
      'X-User-Id': userId ? userId.toString() : localStorage.getItem('userId') || '1',
      'X-Tenant-Id': localStorage.getItem('tenantId') || '1'
    });

    console.log('[DEBUG IdeaService] Request payload:', request);

    // Construire la requête avec tous les champs
    const payload = {
      title: request.title,
      description: request.description,
      category: request.category,
      priority: request.priority,
      imageBase64: this.processImageData((request as any).image || request.image || null),
      attachments: (request as any).attachments || []
    };

    console.log('[DEBUG IdeaService] Final payload:', payload);

    return this.http.post<IdeaFrontend>(this.baseUrl, payload, { headers });
  }

  // Helper method to process image data into the correct format
  private processImageData(imageData: any): string | null {
    if (!imageData) {
      return null;
    }

    // If it's already a string (base64), return as is
    if (typeof imageData === 'string') {
      // If it's a data URL, extract the base64 part
      if (imageData.startsWith('data:')) {
        return imageData.split(',')[1]; // Remove data:image/...;base64, prefix
      }
      return imageData;
    }

    // If it's an object with dataBase64 property
    if (imageData.dataBase64) {
      return imageData.dataBase64;
    }

    // If it's an object with data property
    if (imageData.data) {
      // If data is a data URL, extract base64
      if (imageData.data.startsWith('data:')) {
        return imageData.data.split(',')[1];
      }
      return imageData.data;
    }

    return null;
  }

  // Créer une nouvelle idée avec image + attachments (multipart)
  createIdeaMultipart(payload: {
    title: string;
    description: string;
    category?: string;
    priority?: string;
    imageFile?: File | null;
    attachments?: File[];
  }, userId?: number): Observable<IdeaFrontend> {
    const headers = new HttpHeaders({
      'X-User-Id': userId ? userId.toString() : localStorage.getItem('userId') || '1',
      'X-Tenant-Id': localStorage.getItem('tenantId') || '1'
    });

    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    if (payload.category) formData.append('category', payload.category);
    if (payload.priority) formData.append('priority', payload.priority);
    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    }
    (payload.attachments || []).forEach(f => {
      formData.append('attachments', f);
    });

    return this.http.post<IdeaFrontend>(this.baseUrl, formData, { headers });
  }

  // Par ID (si besoin)
  getIdeaById(id: number): Observable<IdeaBackend> {
    return this.http.get<IdeaBackend>(`${this.baseUrl}/${id}`);
  }

  // === COMMENTS MANAGEMENT ===
  
  // Get all comments for an idea
  getCommentsByIdeaId(ideaId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/${ideaId}/comments`);
  }

  // Add a comment to an idea
  addComment(ideaId: number, content: string, userId?: number, userName?: string, tenantId?: number): Observable<Comment> {
    const headers = new HttpHeaders({
      'X-User-Id': userId ? userId.toString() : localStorage.getItem('userId') || '1',
      'X-Tenant-Id': tenantId ? tenantId.toString() : localStorage.getItem('tenantId') || '1',
      'X-User-Name': userName || localStorage.getItem('userName') || 'Anonymous'
    });

    return this.http.post<Comment>(`${this.baseUrl}/${ideaId}/comments`, 
      { content }, { headers });
  }

  // Like/unlike a comment
  toggleCommentLike(commentId: number, userId?: number, tenantId?: number): Observable<{ likes: number; isLiked: boolean }> {
    const headers = new HttpHeaders({
      'X-User-Id': userId ? userId.toString() : localStorage.getItem('userId') || '1',
      'X-Tenant-Id': tenantId ? tenantId.toString() : localStorage.getItem('tenantId') || '1'
    });

    return this.http.post<{ likes: number; isLiked: boolean }>(
      `${this.baseUrl}/comments/${commentId}/like`, {}, { headers });
  }

  // Like/unlike an idea
  toggleIdeaLike(ideaId: number, userId?: number, tenantId?: number): Observable<{ likes: number; isLiked: boolean }> {
    const headers = new HttpHeaders({
      'X-User-Id': userId ? userId.toString() : localStorage.getItem('userId') || '1',
      'X-Tenant-Id': tenantId ? tenantId.toString() : localStorage.getItem('tenantId') || '1'
    });

    return this.http.post<{ likes: number; isLiked: boolean }>(
      `${this.baseUrl}/${ideaId}/like`, {}, { headers });
  }

  // === ATTACHMENTS MANAGEMENT ===
  
  // Upload attachment for an idea
  uploadAttachment(ideaId: number, file: File): Observable<Attachment> {
    const headers = new HttpHeaders({
      'X-User-Id': localStorage.getItem('userId') || '1',
      'X-Tenant-Id': localStorage.getItem('tenantId') || '1'
    });

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Attachment>(`${this.baseUrl}/${ideaId}/attachments`, 
      formData, { headers });
  }

  // Get all attachments for an idea
  getAttachmentsByIdeaId(ideaId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.baseUrl}/${ideaId}/attachments`);
  }
}
