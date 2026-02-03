import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Always include credentials
    if (!request.withCredentials) {
      request = request.clone({ withCredentials: true });
    }

    // Collect optional multi-tenant header from localStorage
    const tenantId = localStorage.getItem('tenantId') || localStorage.getItem('organizationId') || localStorage.getItem('orgId');

    const headers: { [name: string]: string } = {};

    // Add token for non-auth calls
    if (token && !request.url.includes('/auth/')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add X-Tenant-Id if available
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }

    if (Object.keys(headers).length > 0) {
      request = request.clone({ setHeaders: headers });
    }

    return next.handle(request);
  }
}
