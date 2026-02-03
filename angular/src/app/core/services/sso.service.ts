import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

export interface SsoVerificationResponse {
  success: boolean;
  tenantId?: string;
  tenantName?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SsoService {
  private apiBaseUrl = 'http://localhost:8080/api/onboarding';

  constructor(private http: HttpClient) {}

  /**
   * Vérifier si un code SSO existe et est valide en base de données
   */
  verifySsoCode(code: string): Observable<SsoVerificationResponse> {
    return this.http.get(`${this.apiBaseUrl}/sso/verify/${code}`).pipe(
      map(response => {
        console.log('[DEBUG SSO] Backend response:', response);
        
        // Handle both boolean and object responses
        if (typeof response === 'boolean') {
          // Backend returns boolean, convert to structured response
          if (response === true) {
            // Code is valid, but we need tenant info - use mock mapping
            const validCodes = {
              'TECH01': { tenantId: '2', tenantName: 'TechCorp' },
              'START01': { tenantId: '3', tenantName: 'StartupHub' },
              'INNOV01': { tenantId: '4', tenantName: 'InnovationLab' },
              'CORP01': { tenantId: '5', tenantName: 'CorporateSolutions' }
            };

            if (validCodes.hasOwnProperty(code)) {
              const org = validCodes[code as keyof typeof validCodes];
              return {
                success: true,
                tenantId: org.tenantId,
                tenantName: org.tenantName,
                message: `Code valide! Bienvenue dans ${org.tenantName}`
              };
            } else {
              return {
                success: false,
                message: 'Code SSO valide mais organisation non trouvée'
              };
            }
          } else {
            return {
              success: false,
              message: 'Code SSO invalide, expiré ou déjà utilisé.'
            };
          }
        } else if (response && typeof response === 'object') {
          // Backend already returns structured response
          return response as SsoVerificationResponse;
        } else {
          // Unexpected response format
          return {
            success: false,
            message: 'Réponse serveur invalide'
          };
        }
      }),
      catchError(error => {
        console.log('[DEBUG SSO] Backend error, using mock verification:', error);
        return this.mockVerifySsoCode(code);
      })
    );
  }

  /**
   * Mock verification for development when backend is not available
   */
  private mockVerifySsoCode(code: string): Observable<SsoVerificationResponse> {
    console.log(`[DEBUG SSO] Mock verification for code: ${code}`);
    
    // Simulate network delay
    return of(null).pipe(
      delay(1500), // 1.5 second delay to simulate network
      map(() => {
        // Mock validation logic
        const validCodes = {
          'TECH01': { tenantId: '2', tenantName: 'TechCorp' },
          'START01': { tenantId: '3', tenantName: 'StartupHub' },
          'INNOV01': { tenantId: '4', tenantName: 'InnovationLab' },
          'CORP01': { tenantId: '5', tenantName: 'CorporateSolutions' }
        };

        if (validCodes.hasOwnProperty(code)) {
          const org = validCodes[code as keyof typeof validCodes];
          console.log(`[DEBUG SSO] Code ${code} is valid for ${org.tenantName}`);
          return {
            success: true,
            tenantId: org.tenantId,
            tenantName: org.tenantName,
            message: `Code valide! Bienvenue dans ${org.tenantName}`
          };
        } else {
          console.log(`[DEBUG SSO] Code ${code} is invalid`);
          return {
            success: false,
            message: 'Code SSO invalide, expiré ou déjà utilisé.'
          };
        }
      })
    );
  }

  /**
   * Sauvegarder un code SSO généré localement en base de données
   */
  saveSsoCode(code: string, tenantType: string): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/sso/create`, {}, {
      params: {
        code: code,
        tenantType: tenantType
      }
    });
  }
}
