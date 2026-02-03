import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeamAssignmentCreateRequest {
  ideaId: number;
  userId: number;
  assignedById: number;
  role: string;
}

export interface TeamAssignmentDTO {
  id?: number;
  ideaId: number;
  userId: number;
  assignedById: number;
  assignmentDate?: string;
  role: string;
}

export interface TeamMember {
  id: number;
  // Backend typically returns fullname; some UI code may use name
  name?: string;
  fullname?: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
  profilePicture?: string;
  tenantId?: number;
  tenantName?: string;
  tenantType?: string;
  entityType?: string;
  assignedProjects?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamAssignmentService {
  private baseUrl = 'http://localhost:8080/api/teams';
  private teamMembersUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Get all team assignments
   */
  getAllAssignments(): Observable<TeamAssignmentDTO[]> {
    return this.http.get<TeamAssignmentDTO[]>(`${this.baseUrl}`);
  }

  /**
   * Get assignments for a specific idea
   */
  getAssignmentsByIdea(ideaId: number): Observable<TeamAssignmentDTO[]> {
    return this.http.get<TeamAssignmentDTO[]>(`${this.baseUrl}/by-idea/${ideaId}`);
  }

  /**
   * Get assignments for a specific user
   */
  getAssignmentsByUser(userId: number): Observable<TeamAssignmentDTO[]> {
    return this.http.get<TeamAssignmentDTO[]>(`${this.baseUrl}/by-user/${userId}`);
  }

  /**
   * Create a new team assignment
   */
  createAssignment(request: TeamAssignmentCreateRequest): Observable<TeamAssignmentDTO> {
    return this.http.post<TeamAssignmentDTO>(`${this.baseUrl}`, request);
  }

  /**
   * Update an existing assignment
   */
  updateAssignment(id: number, request: TeamAssignmentCreateRequest): Observable<TeamAssignmentDTO> {
    return this.http.put<TeamAssignmentDTO>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Delete an assignment
   */
  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all team members
   */
  getAllTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.teamMembersUrl}`);
  }

  /**
   * Get a specific team member
   */
  getTeamMember(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.teamMembersUrl}/${id}`);
  }

  /**
   * Create a new team member
   */
  createTeamMember(member: TeamMember): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.teamMembersUrl}`, member);
  }

  /**
   * Update a team member
   */
  updateTeamMember(id: number, member: TeamMember): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.teamMembersUrl}/${id}`, member);
  }

  /**
   * Delete a team member
   */
  deleteTeamMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.teamMembersUrl}/${id}`);
  }

  /**
   * Get team members for a specific department
   */
  getMembersByDepartment(department: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.teamMembersUrl}?department=${department}`);
  }
}
