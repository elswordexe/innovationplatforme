import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Décoder le JWT pour extraire le tenantId
      try {
        const payload = this.parseJwt(token);
        const tenantId = payload.userId; // Ou tu peux utiliser un autre champ du JWT
        
        // Ajouter le header X-Tenant-Id à la requête
        request = request.clone({
          setHeaders: {
            'X-Tenant-Id': tenantId ? tenantId.toString() : ''
          }
        });
      } catch (e) {
        console.error('Erreur en décodant le JWT:', e);
      }
    }
    
    return next.handle(request);
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
