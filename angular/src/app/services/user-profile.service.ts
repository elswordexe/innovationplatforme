import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export interface UserProfile {
  id: number;
  fullname: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  affiliation?: string;
  tenantName?: string;
  profileImageUrl?: string;
  profilePicture?: string;
}

export interface ProfileUpdateRequest {
  fullname?: string;
  profilePicture?: string;
  department?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'http://localhost:8080/api/users';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private hasLoadedProfile = false;

  constructor(private http: HttpClient) {
  }

  /**
   * Charge le profil de l'utilisateur connecté
   */
  loadUserProfile(force: boolean = false): void {
    if (!force && this.hasLoadedProfile && this.currentUserSubject.value) {
      return;
    }

    const userId = localStorage.getItem('userId');
    if (userId) {
      this.getUserProfile(parseInt(userId)).subscribe({
        next: (profile) => {
          this.currentUserSubject.next(profile);
          this.hasLoadedProfile = true;
          localStorage.setItem('userProfile', JSON.stringify(profile));
        },
        error: (err) => {
          console.error('Erreur chargement profil utilisateur', err);
          // Charger depuis localStorage si disponible
          const stored = localStorage.getItem('userProfile');
          if (stored) {
            this.currentUserSubject.next(JSON.parse(stored));
            this.hasLoadedProfile = true;
          }
        }
      });
    }
  }

  /**
   * Récupère le profil d'un utilisateur par ID
   */
  getUserProfile(userId: number): Observable<UserProfile> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString()
    });
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`, { headers });
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  getCurrentUserProfile(): Observable<UserProfile> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return of({
        id: 1,
        fullname: 'Utilisateur',
        email: 'user@example.com',
        role: 'User',
        affiliation: 'Unknown'
      });
    }
    return this.getUserProfile(parseInt(userId));
  }

  /**
   * Met à jour le profil utilisateur
   */
  updateUserProfile(userId: number, profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${userId}`, profile).pipe(
      tap((updatedProfile) => {
        this.currentUserSubject.next(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      })
    );
  }

  /**
   * Upload profile picture for user
   */
  uploadProfilePicture(file: File): Observable<UserProfile> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return of({} as UserProfile);
    }

    const headers = new HttpHeaders({
      'X-User-Id': userId,
      'X-Tenant-Id': localStorage.getItem('tenantId') || '1'
    });

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UserProfile>(`${this.apiUrl}/${userId}/profile-picture`, formData, { headers })
      .pipe(
        tap(response => {
          // Update current user with new profile picture
          this.currentUserSubject.next(response);
          localStorage.setItem('userProfile', JSON.stringify(response));
          this.hasLoadedProfile = true;
        }),
        catchError(err => {
          console.error('Profile picture upload failed:', err);
          // Convert to base64 as fallback
          return this.convertFileToBase64(file).pipe(
            map(base64 => {
              const currentUser = this.currentUserSubject.value;
              const updatedUser = {
                ...(currentUser || ({} as UserProfile)),
                profileImageUrl: base64
              };
              this.currentUserSubject.next(updatedUser);
              localStorage.setItem('userProfile', JSON.stringify(updatedUser));
              this.hasLoadedProfile = true;
              return updatedUser;
            })
          );
        })
      );
  }

  /**
   * Convert file to base64 as fallback
   */
  private convertFileToBase64(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        observer.next(base64);
        observer.complete();
      };
      reader.onerror = error => observer.error(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Update profile picture URL directly
   */
  updateProfilePicture(userId: number, profilePictureUrl: string): Observable<UserProfile> {
    const headers = new HttpHeaders({
      'X-User-Id': userId.toString(),
      'X-Tenant-Id': localStorage.getItem('tenantId') || '1',
      'Content-Type': 'text/plain'
    });

    return this.http.put<UserProfile>(`${this.apiUrl}/${userId}/profile-picture`, 
      profilePictureUrl, { headers })
      .pipe(
        tap((updatedProfile) => {
          this.currentUserSubject.next(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }),
        catchError(err => {
          console.error('Profile picture update failed:', err);
          // Fallback: update locally
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const updatedUser = { ...currentUser, profileImageUrl: profilePictureUrl };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('userProfile', JSON.stringify(updatedUser));
          }
          return of(currentUser || {} as UserProfile);
        })
      );
  }

  /**
   * Retourne l'utilisateur courant (valeur, pas Observable)
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Génère un avatar par défaut si pas de photo
   */
  getAvatarUrl(user: UserProfile): string {
    // Priorité 1: Image de profil définie
    if (user.profilePicture && user.profilePicture.trim() !== '') {
      return user.profilePicture;
    }

    if (user.profileImageUrl && user.profileImageUrl.trim() !== '') {
      return user.profileImageUrl;
    }
    
    // Priorité 2: Générer un avatar basé sur le nom avec les couleurs de la marque
    if (user.fullname && user.fullname.trim() !== '') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=915506&color=fff&size=150`;
    }
    
    // Priorité 3: Avatar basé sur l'email
    if (user.email && user.email.trim() !== '') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=915506&color=fff&size=150`;
    }
    
    // Fallback: Avatar générique
    return 'https://ui-avatars.com/api/?name=User&background=915506&color=fff&size=150';
  }
}
