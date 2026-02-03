import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  // Application role (USER / MANAGER / HR / ADMIN)
  role: string;
  entityType?: 'individual' | 'startup' | 'organization';
  ssoCode?: string;
  // For startup/organization: create or label the tenant
  tenantName?: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
  tenantId?: number;
  tenantType?: string;
  entityType?: string;
}

export interface UserDTO {
  id: number;
  fullname: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('Login response:', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('userId', response.userId.toString());
        
        // Store email for tenant identification
        localStorage.setItem('userEmail', request.email);
        
        // Store tenant information if available
        if (response.tenantId) {
          localStorage.setItem('tenantId', response.tenantId.toString());
        } else {
          localStorage.setItem('tenantId', '1'); // Default for individual users
        }
        
        if (response.tenantType) {
          localStorage.setItem('tenantType', response.tenantType);
        }
        
        if (response.entityType) {
          localStorage.setItem('entityType', response.entityType);
        }
        
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next({
          token: response.token,
          role: response.role,
          userId: response.userId,
          tenantId: response.tenantId,
          tenantType: response.tenantType,
          entityType: response.entityType
        });
      })
    );
  }

  register(request: RegisterRequest): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/register`, request, {
      withCredentials: true
    }).pipe(
      tap(response => {
        localStorage.setItem('user', JSON.stringify(response));
        this.currentUserSubject.next(response);
      })
    );
  }

  /**
   * Create or register an SSO code for an organization/startup using the Onboarding controller.
   * POST /api/onboarding/{tenantType}/{tenantId}/sso
   */
  createSsoCode(tenantType: string, tenantId: number, body: { code: string; managerEmail?: string; prefix?: string; maxUses?: number }): Observable<any> {
    const pathTenant = encodeURIComponent(tenantType || '');
    return this.http.post<any>(`/api/onboarding/${pathTenant}/${tenantId}/sso`, body, { withCredentials: true });
  }

  /**
   * Create a tenant (organization/startup).
   * POST /api/tenants
   */
  createTenant(body: { name: string; tenantType: string }): Observable<any> {
    return this.http.post<any>(`/api/tenants`, body, { withCredentials: true });
  }

  /**
   * Login using an SSO code + email (organization login flow).
   */
  ssoLogin(payload: { email: string; ssoCode: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/sso-login`, payload, { withCredentials: true }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('userId', response.userId.toString());
        this.currentUserSubject.next({ token: response.token, role: response.role, userId: response.userId });
      })
    );
  }

  /**
   * Redeem an SSO code or invite token via OnboardingController
   * POST /api/onboarding/redeem
   */
  redeemOnboarding(payload: { ssoCode?: string; inviteToken?: string; email?: string }): Observable<any> {
    return this.http.post<any>(`/api/onboarding/redeem`, payload, { withCredentials: true });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
