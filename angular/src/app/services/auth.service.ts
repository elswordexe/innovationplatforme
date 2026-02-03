import { Injectable } from '@angular/core';
import { UserProfileService, UserProfile } from './user-profile.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  HR = 'HR'
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
  tenantId?: number;
  tenantType?: string;
  entityType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserRoleSubject = new BehaviorSubject<UserRole | null>(null);
  public currentUserRole$ = this.currentUserRoleSubject.asObservable();

  constructor(private userProfileService: UserProfileService) {
    this.initializeUserRole();
  }

  private initializeUserRole(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      if (user) {
        const role = this.mapStringToRole(user.role);
        this.currentUserRoleSubject.next(role);
      }
    });
  }

  private mapStringToRole(roleString: string): UserRole {
    switch (roleString?.toUpperCase()) {
      case 'ADMIN':
        return UserRole.ADMIN;
      case 'MANAGER':
        return UserRole.MANAGER;
      case 'HR':
        return UserRole.HR;
      default:
        return UserRole.USER;
    }
  }

  getCurrentUserRole(): UserRole | null {
    return this.currentUserRoleSubject.value;
  }

  isManager(): boolean {
    return this.currentUserRoleSubject.value === UserRole.MANAGER || 
           this.currentUserRoleSubject.value === UserRole.ADMIN;
  }

  isHR(): boolean {
    return this.currentUserRoleSubject.value === UserRole.HR || 
           this.currentUserRoleSubject.value === UserRole.ADMIN;
  }

  isAdmin(): boolean {
    return this.currentUserRoleSubject.value === UserRole.ADMIN;
  }

  hasManagerAccess(): boolean {
    return this.isManager() || this.isHR();
  }

  canApproveIdeas(): boolean {
    return this.isManager() || this.isAdmin();
  }

  canAssignToProjects(): boolean {
    return this.isManager() || this.isAdmin();
  }

  canSubmitToHR(): boolean {
    return this.isManager() || this.isAdmin();
  }

  canProvideFeedback(): boolean {
    return this.isManager() || this.isHR() || this.isAdmin();
  }
}
