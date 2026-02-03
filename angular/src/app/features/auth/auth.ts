import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest } from '../../core/services/auth.service';
import { SsoService } from '../../core/services/sso.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  encapsulation: ViewEncapsulation.None,
})
export class Auth implements OnInit {
  // Login form
  loginEmail = '';
  loginPassword = '';

  // Register form
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  // Application role
  registerRole: 'USER' | 'MANAGER' | 'HR' = 'USER';
  registerEntityType: 'individual' | 'startup' | 'organization' = 'individual';
  registerTenantName: string = '';
  registerSsoCode: string = '';
  // Tenant info for SSO creation (optional when creating code on server)
  registerTenantId: number | null = null;
  // SSO UI state
  ssoCreated = false;
  ssoLoginCode = '';
  showSsoPrompt = false;

  loading = false;
  errorMessage = '';
  infoMessage = '';
  selectedUserType: 'individual' | 'startup' | 'organization' | null = null;

  // UI State
  showTabs = true;
  showLogin = true;
  showRegister = false;
  showOnboarding1 = false;

  constructor(
    private authService: AuthService,
    private ssoService: SsoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'register') {
        // Si un type est spécifié, on pré-sélectionne
        if (params['type']) {
          const type = params['type'] as 'individual' | 'startup' | 'organization';
          this.selectUserType(type);
        } else {
          // Sinon, on affiche l'écran de sélection
          this.switchToOnboarding1();
        }
      }
    });
  }

  switchToLogin() {
    this.showTabs = true;
    this.showLogin = true;
    this.showRegister = false;
    this.showOnboarding1 = false;
  }

  switchToRegister() {
    this.showTabs = true;
    this.showLogin = false;
    this.showRegister = true;
    this.showOnboarding1 = false;
  }

  switchToOnboarding1() {
    this.showTabs = false;
    this.showLogin = false;
    this.showRegister = false;
    this.showOnboarding1 = true;
  }

  selectUserType(type: 'individual' | 'startup' | 'organization') {
    this.selectedUserType = type;

    // Propagate the entity type to the register model so the register form
    // can show the SSO input when appropriate.
    this.registerEntityType = type;

    // Default app role when registering
    this.registerRole = 'USER';

    this.showTabs = true;
    this.showLogin = false;
    this.showRegister = true;
    this.showOnboarding1 = false;
  }

  /** Generate a random 6-character alphanumeric SSO code (locally only) */
  generateSsoCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Store locally - will be saved to database during registration
    this.registerSsoCode = code;
    this.ssoCreated = true;
    this.infoMessage = 'Code SSO généré!';
    setTimeout(() => this.infoMessage = '', 3000);
  }

  onSsoLogin(event: Event) {
    // Legacy handler retained for direct calls — forward to confirm flow
    event.preventDefault();
    this.startSsoFlow();
  }

  /** Start SSO flow: show prompt to enter SSO code */
  startSsoFlow() {
    this.errorMessage = '';
    this.infoMessage = '';
    this.showSsoPrompt = true;
  }

  /** Confirm SSO code: store code and redirect user to enter credentials */
  confirmSsoCode(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.ssoLoginCode) {
      this.errorMessage = 'Veuillez saisir le code SSO.';
      return;
    }

    // Optionally store the SSO code for subsequent requests
    try { localStorage.setItem('ssoCode', this.ssoLoginCode.trim().toUpperCase()); } catch(e) { /* ignore */ }

    this.showSsoPrompt = false;
    // Switch to regular login so user can enter email/password
    this.switchToLogin();
    this.infoMessage = 'Code SSO accepté — renseignez maintenant vos identifiants.';
    setTimeout(() => this.infoMessage = '', 5000);
  }

  cancelSso() {
    this.showSsoPrompt = false;
    this.ssoLoginCode = '';
    this.infoMessage = '';
    this.errorMessage = '';
  }

  onLogin(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    const loginRequest: LoginRequest = {
      email: this.loginEmail,
      password: this.loginPassword
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('✓ Login successful:', response);
        console.log('✓ Token stored:', localStorage.getItem('token'));
        console.log('✓ UserId stored:', localStorage.getItem('userId'));
        this.loading = false;
        console.log('Redirecting to /dash...');
        this.router.navigate(['/dash']).then(success => {
          console.log('Navigation result:', success);
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('✗ Login failed:', error);
        this.errorMessage = error.error?.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.';
      }
    });
  }

  onRegister(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.performRegister();
  }

  private performRegister() {
    this.loading = true;
    this.errorMessage = '';
    
    // Save SSO code if it was generated (before creating user)
    const ssoCode = (this.registerSsoCode || '').trim() ? (this.registerSsoCode || '').trim().toUpperCase() : undefined;
    if (ssoCode) {
      const tenantType = this.registerEntityType === 'organization' ? 'ORGANIZATION' : 'STARTUP';
      this.ssoService.saveSsoCode(ssoCode, tenantType).subscribe({
        next: () => {
          console.log('SSO code saved successfully:', ssoCode);
          this.createUser();
        },
        error: (err) => {
          console.warn('SSO code save failed', err);
          // Continue with user creation anyway
          this.createUser();
        }
      });
    } else {
      this.createUser();
    }
  }

  private createUser() {
    const registerRequest: RegisterRequest = {
      fullname: this.registerName,
      email: this.registerEmail,
      password: this.registerPassword,
      role: this.registerRole,
      entityType: this.registerEntityType,
      ssoCode: (this.registerSsoCode || '').trim() ? (this.registerSsoCode || '').trim().toUpperCase() : undefined,
      tenantName: (this.registerTenantName || '').trim() ? (this.registerTenantName || '').trim() : undefined
    };

    console.log('Creating user with request:', registerRequest);

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        this.loading = false;
        // Redirect to post-registration page for individual users, or dashboard for startup/org
        if (this.registerEntityType === 'individual') {
          this.router.navigate(['/post-registration']);
        } else {
          this.router.navigate(['/dash']);
        }
      },
      error: (error) => {
        console.error('User creation failed:', error);
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
      }
    });
  }
}
