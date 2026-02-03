import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectDto {
  id?: number;
  title: string;
  description: string;
  status: string;
  progress: number;
  ideasCount?: number;
  votesCount?: number;
  feedbacksCount?: number;
  icon?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Projects are approved ideas
  private baseUrl = 'http://localhost:8080/api/ideas'; // Gateway API

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    // La gateway va maintenant propager X-Tenant-Id depuis le JWT
    // Nous n'avons plus besoin de le forcer manuellement
    const headers = new HttpHeaders();
    console.log('[DEBUG ProjectService] Using gateway-propagated headers');
    return headers;
  }

  // Fetch approved ideas as projects
  getAllProjects(): Observable<ProjectDto[]> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/status/APPROVED`;
    
    console.log('[DEBUG ProjectService] Getting all projects from:', url);
    console.log('[DEBUG ProjectService] Using gateway-propagated headers (no manual X-Tenant-Id)');
    
    return this.http.get<ProjectDto[]>(url, { headers });
  }

  getProjectById(id: number): Observable<ProjectDto> {
    const headers = this.getHeaders();
    return this.http.get<ProjectDto>(`${this.baseUrl}/${id}`, { headers });
  }

  createProject(project: ProjectDto): Observable<ProjectDto> {
    const headers = this.getHeaders();
    return this.http.post<ProjectDto>(this.baseUrl, project, { headers });
  }

  updateProject(id: number, project: ProjectDto): Observable<ProjectDto> {
    const headers = this.getHeaders();
    return this.http.put<ProjectDto>(`${this.baseUrl}/${id}`, project, { headers });
  }

  deleteProject(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }
}
