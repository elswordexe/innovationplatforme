import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SsoService, SsoVerificationResponse } from '../../core/services/sso.service';
import { OrganizationService } from '../../services/organization.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-post-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-registration.html',
  styleUrl: './post-registration.css'
})
export class PostRegistration implements OnInit {
  joinCode = '';
  inviteEmail = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  // State
  showStep1 = true; // Options: Rejoindre ou Inviter
  showJoinForm = false;
  showInviteForm = false;
  
  // For cancellation
  private verificationSubscription: any = null;

  constructor(
    private ssoService: SsoService,
    private organizationService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit() {}

  selectJoin() {
    this.showStep1 = false;
    this.showJoinForm = true;
    this.showInviteForm = false;
  }

  selectInvite() {
    this.showStep1 = false;
    this.showJoinForm = false;
    this.showInviteForm = true;
  }

  goBack() {
    this.showStep1 = true;
    this.showJoinForm = false;
    this.showInviteForm = false;
    this.joinCode = '';
    this.inviteEmail = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  joinGroup() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.joinCode.trim()) {
      this.errorMessage = 'Veuillez entrer un code SSO';
      return;
    }

    this.loading = true;
    const code = this.joinCode.trim().toUpperCase();

    console.log(`[DEBUG Post-Registration] Verifying SSO code: ${code}`);

    // Add timeout of 10 seconds to prevent infinite loading
    this.verificationSubscription = this.ssoService.verifySsoCode(code).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('[DEBUG Post-Registration] Timeout or error:', error);
        this.loading = false;
        this.verificationSubscription = null;
        if (error.name === 'TimeoutError') {
          this.errorMessage = 'La vérification du code prend trop de temps. Veuillez réessayer.';
        } else {
          this.errorMessage = 'Erreur de connexion au serveur. Veuillez vérifier votre connexion et réessayer.';
        }
        return of(null);
      })
    ).subscribe({
      next: (response: SsoVerificationResponse | null) => {
        this.loading = false;
        this.verificationSubscription = null;
        
        if (!response) {
          this.errorMessage = 'Impossible de vérifier le code. Veuillez réessayer.';
          return;
        }

        if (response.success) {
          console.log('[DEBUG Post-Registration] Code verified successfully:', response);
          
          // Notify all components that user joined an organization
          this.organizationService.notifyOrganizationJoined(
            response.tenantId || '1',
            response.tenantName || 'Organization',
            parseInt(localStorage.getItem('userId') || '0')
          );

          this.successMessage = `✓ Vous avez rejoint le groupe! Code: ${code}`;
          setTimeout(() => {
            this.router.navigate(['/dash']);
          }, 2000);
        } else {
          console.log('[DEBUG Post-Registration] Code verification failed:', response);
          this.errorMessage = response.message || 'Code SSO invalide, expiré ou déjà utilisé.';
        }
      }
    });
  }

  cancelVerification(): void {
    console.log('[DEBUG Post-Registration] cancelVerification called');
    if (this.verificationSubscription) {
      this.verificationSubscription.unsubscribe();
      this.verificationSubscription = null;
    }
    
    this.loading = false;
    this.errorMessage = 'Vérification annulée. Vous pouvez réessayer.';
    console.log('[DEBUG Post-Registration] Verification cancelled by user');
  }

  sendInvite() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.inviteEmail.trim()) {
      this.errorMessage = 'Veuillez entrer une adresse email';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.inviteEmail)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }

    this.loading = true;

    // For now, just show success message
    // In a real app, this would call a backend endpoint to send an invite
    setTimeout(() => {
      this.loading = false;
      this.successMessage = `✓ Une invitation a été envoyée à ${this.inviteEmail}`;
      this.inviteEmail = '';
      setTimeout(() => {
        this.router.navigate(['/dash']);
      }, 2000);
    }, 1000);
  }

  skipStep() {
    this.router.navigate(['/dash']);
  }
}
