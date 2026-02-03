import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbside } from '../../core/components/navbside/navbside';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { Subject, interval, timeout } from 'rxjs';
import { takeUntil, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  profilePicture: string;
  department: string;
  joinDate: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbside, Sidebar, FileSizePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit, OnDestroy {
  profile: ProfileData = {
    id: 0, // Will be set from backend
    name: '', // Will be set from backend
    email: '', // Will be set from backend
    profilePicture: '', // Will be set from backend
    department: '', // Will be set from backend
    joinDate: '' // Will be set from backend
  };

  isEditing = false;
  editedName = '';
  selectedFile: File | null = null;
  previewUrl = '';
  isUploading = false;
  saveError = '';
  saveSuccess = '';
  
  // Image storage functionality
  storedImages: Array<{ id: string; name: string; data: string; size: number; type: string }> = [];
  isImageStorageMode = false;

  private destroy$ = new Subject<void>();

  constructor(private userProfileService: UserProfileService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadStoredImages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPeriodicRefresh(): void {
    // Refresh profile every 15 seconds
    interval(15000)
      .pipe(
        switchMap(() => this.userProfileService.getCurrentUserProfile()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (user) => {
          if (user && !this.isEditing) {
            this.updateProfileFromUser(user);
          }
        },
        error: (err) => {
          console.warn('Error during periodic refresh:', err);
        }
      });
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const parts = dataUrl.split(',');
    const match = parts[0].match(/data:(.*?);base64/);
    const mime = match ? match[1] : 'application/octet-stream';
    const binary = atob(parts[1]);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], filename, { type: mime });
  }

  loadUserProfile(): void {
    console.log('[DEBUG Profile] Starting loadUserProfile');
    // First try to load from backend
    this.userProfileService.getCurrentUserProfile().pipe(
      timeout(5000),
      catchError(err => {
        console.warn('[DEBUG Profile] Error/timeout loading profile from backend:', err);
        return of(null);
      })
    ).subscribe({
      next: (user) => {
        console.log('[DEBUG Profile] Profile loaded:', user?.id);
        if (user) {
          this.updateProfileFromUser(user);
        } else {
          // Fallback to localStorage if backend returns null
          this.loadFromLocalStorage();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('[DEBUG Profile] Failed to load profile from backend, using localStorage:', err);
        this.loadFromLocalStorage();
        this.cdr.detectChanges();
      }
    });
  }

  private loadFromLocalStorage(): void {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const user = JSON.parse(savedProfile);
        this.updateProfileFromUser(user);
      } catch (error) {
        console.error('Error parsing profile from localStorage:', error);
        this.initializeDefaultProfile();
      }
    } else {
      this.initializeDefaultProfile();
    }
  }

  private updateProfileFromUser(user: UserProfile): void {
    this.profile = {
      id: user.id,
      name: user.fullname,
      email: user.email,
      profilePicture: user.profileImageUrl || this.userProfileService.getAvatarUrl(user),
      department: user.department || 'Innovation Team',
      joinDate: 'January 2024' // Could be added to backend model
    };
    this.editedName = this.profile.name;
    this.previewUrl = this.profile.profilePicture;
  }

  private initializeDefaultProfile(): void {
    const defaultUser: UserProfile = {
      id: parseInt(localStorage.getItem('userId') || '1'),
      fullname: 'John Doe',
      email: 'john.doe@company.com',
      role: 'USER'
    };
    
    this.updateProfileFromUser(defaultUser);
  }

  enableEdit(): void {
    this.isEditing = true;
    this.editedName = this.profile.name;
    this.clearMessages();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editedName = this.profile.name;
    this.selectedFile = null;
    this.previewUrl = this.profile.profilePicture;
    this.clearMessages();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.previewImage();
    }
  }

  previewImage(): void {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removePicture(): void {
    this.selectedFile = null;
    this.previewUrl = this.userProfileService.getAvatarUrl({
      id: this.profile.id,
      fullname: this.profile.name,
      email: this.profile.email,
      role: 'USER'
    });
  }

  async saveProfile(): Promise<void> {
    if (!this.editedName.trim()) {
      this.saveError = 'Le nom ne peut pas être vide';
      return;
    }

    this.isUploading = true;
    this.clearMessages();

    try {
      // First upload profile picture if changed
      if (this.selectedFile && this.previewUrl !== this.profile.profilePicture) {
        await this.uploadProfilePicture();
      }

      // Then update profile data
      await this.updateProfileData();
      
      // Update local profile immediately for better UX
      this.profile.name = this.editedName;
      this.profile.profilePicture = this.previewUrl;
      
      // Update service state to persist changes
      this.updateServiceState();
      
      this.saveSuccess = 'Profil mis à jour avec succès!';
      this.isEditing = false;
      
    } catch (error) {
      console.error('Error saving profile:', error);
      this.saveError = 'Erreur lors de la sauvegarde du profil';
    } finally {
      this.isUploading = false;
    }
  }

  private updateServiceState(): void {
    // Update the service with current profile data
    const currentUser = this.userProfileService.getCurrentUser();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        fullname: this.profile.name,
        department: this.profile.department
      };
      
      // Update localStorage directly for immediate persistence
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      
      // Trigger service update to maintain consistency
      this.userProfileService.updateUserProfile(this.profile.id, {
        fullname: this.profile.name,
        department: this.profile.department
      }).subscribe({
        next: (response) => {
          console.log('Profile updated in backend:', response);
          this.userProfileService.loadUserProfile(true);
        },
        error: (err) => {
          console.warn('Backend update failed, but localStorage updated:', err);
        }
      });
    }
  }

  private async uploadProfilePicture(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        resolve();
        return;
      }

      // Use real backend service for upload - sends to POST /api/users/{id}/profile-picture
      this.userProfileService.uploadProfilePicture(this.selectedFile).subscribe({
        next: (response: UserProfile) => {
          // Backend returns the updated profile; picture is expected in profileImageUrl
          const newPicture = response?.profileImageUrl || this.previewUrl;
          this.profile.profilePicture = newPicture;
          this.previewUrl = newPicture;
          console.log('Profile picture uploaded successfully to database:', response);
          this.userProfileService.loadUserProfile(true);
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to upload profile picture to database:', err);
          // Fallback: convert to base64 locally
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            this.profile.profilePicture = base64Image;
            this.previewUrl = base64Image;
            resolve();
          };
          reader.readAsDataURL(this.selectedFile as Blob);
        }
      });
    });
  }

  private async updateProfileData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const updates = {
        fullname: this.editedName,
        department: this.profile.department
      };

      // Update via service
      this.userProfileService.updateUserProfile(this.profile.id, updates).subscribe({
        next: (updatedProfile) => {
          // Update local profile
          this.profile.name = updatedProfile.fullname;
          this.profile.department = updatedProfile.department || this.profile.department;
          this.profile.profilePicture = updatedProfile.profileImageUrl || this.profile.profilePicture;
          resolve();
        },
        error: (err) => {
          console.error('Profile update error:', err);
          // Fallback: update locally
          this.profile.name = this.editedName;
          // Update service locally for consistency
          this.userProfileService.currentUser$.subscribe(user => {
            if (user) {
              const updatedUser = { ...user, fullname: this.editedName };
              // Use updateProfileLocally method instead of direct access
              this.userProfileService.updateUserProfile(this.profile.id, updatedUser).subscribe();
            }
          });
          resolve();
        }
      });
    });
  }

  private clearMessages(): void {
    this.saveError = '';
    this.saveSuccess = '';
  }

  // === IMAGE STORAGE FUNCTIONALITY ===
  
  loadStoredImages(): void {
    const stored = localStorage.getItem('storedImages');
    if (stored) {
      try {
        this.storedImages = JSON.parse(stored);
      } catch (error) {
        console.error('Error loading stored images:', error);
        this.storedImages = [];
      }
    }
  }

  saveStoredImages(): void {
    localStorage.setItem('storedImages', JSON.stringify(this.storedImages));
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.convertImageToBase64(file);
    }
  }

  convertImageToBase64(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      
      const imageInfo = {
        id: Date.now().toString(),
        name: file.name,
        data: base64Data,
        size: file.size,
        type: file.type
      };
      
      this.storedImages.unshift(imageInfo);
      this.saveStoredImages();
      
      console.log(`Image ${file.name} converted and stored (${this.formatFileSize(file.size)})`);
    };
    
    reader.onerror = (error) => {
      console.error('Error converting image to base64:', error);
    };
    
    reader.readAsDataURL(file);
  }

  deleteStoredImage(imageId: string): void {
    this.storedImages = this.storedImages.filter(img => img.id !== imageId);
    this.saveStoredImages();
  }

  useStoredImageAsProfile(imageData: string): void {
    this.profile.profilePicture = imageData;
    this.previewUrl = imageData;
    
    // Update service state immediately
    this.updateServiceState();

    // Persist using multipart upload endpoint (avoid huge text/plain payload)
    try {
      const file = this.dataUrlToFile(imageData, 'profile-picture');
      this.userProfileService.uploadProfilePicture(file).subscribe({
        next: (response: UserProfile) => {
          console.log('Stored image uploaded successfully to database as profile picture:', response);
          this.userProfileService.loadUserProfile(true);
        },
        error: (err: any) => {
          console.warn('Failed to upload stored image to database, but updated locally:', err);
        }
      });
    } catch (err) {
      console.warn('Failed to convert stored image to file for upload:', err);
    }
    
    console.log('Stored image set as profile picture and saved to database');
  }

  downloadStoredImage(image: { id: string; name: string; data: string }): void {
    const link = document.createElement('a');
    link.href = image.data;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  toggleImageStorageMode(): void {
    this.isImageStorageMode = !this.isImageStorageMode;
  }

  clearAllStoredImages(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les images stockées ?')) {
      this.storedImages = [];
      this.saveStoredImages();
    }
  }
}
