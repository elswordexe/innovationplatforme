import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface OrganizationChange {
  tenantId: string;
  tenantName?: string;
  userId: number;
  action: 'joined' | 'left' | 'updated';
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private organizationChanged = new Subject<OrganizationChange>();
  private currentOrganization = new BehaviorSubject<{ tenantId: string; tenantName?: string } | null>(null);

  public organizationChanged$ = this.organizationChanged.asObservable();
  public currentOrganization$ = this.currentOrganization.asObservable();

  constructor() {
    // Initialize with current organization from localStorage
    this.initializeCurrentOrganization();
  }

  private initializeCurrentOrganization(): void {
    const tenantId = localStorage.getItem('tenantId');
    const tenantName = localStorage.getItem('tenantName');
    
    if (tenantId && tenantId !== '1') {
      this.currentOrganization.next({
        tenantId,
        tenantName: tenantName || undefined
      });
    }
  }

  // Call this when user joins an organization
  notifyOrganizationJoined(tenantId: string, tenantName?: string, userId?: number): void {
    const change: OrganizationChange = {
      tenantId,
      tenantName,
      userId: userId || parseInt(localStorage.getItem('userId') || '0'),
      action: 'joined',
      timestamp: Date.now()
    };

    // Update localStorage
    localStorage.setItem('tenantId', tenantId);
    if (tenantName) {
      localStorage.setItem('tenantName', tenantName);
    }

    // Update current organization
    this.currentOrganization.next({
      tenantId,
      tenantName
    });

    // Notify all subscribers
    this.organizationChanged.next(change);

    console.log('[OrganizationService] User joined organization:', change);
  }

  // Call this when user leaves an organization
  notifyOrganizationLeft(userId?: number): void {
    const change: OrganizationChange = {
      tenantId: '1', // Default/individual
      userId: userId || parseInt(localStorage.getItem('userId') || '0'),
      action: 'left',
      timestamp: Date.now()
    };

    // Update localStorage
    localStorage.setItem('tenantId', '1');
    localStorage.removeItem('tenantName');

    // Update current organization
    this.currentOrganization.next(null);

    // Notify all subscribers
    this.organizationChanged.next(change);

    console.log('[OrganizationService] User left organization:', change);
  }

  // Get current organization info
  getCurrentOrganization(): { tenantId: string; tenantName?: string } | null {
    return this.currentOrganization.value;
  }

  // Check if user has organization
  hasOrganization(): boolean {
    const org = this.currentOrganization.value;
    return !!(org && org.tenantId && org.tenantId !== '1');
  }

  // Check if user is individual
  isIndividualUser(): boolean {
    return !this.hasOrganization();
  }

  // Force refresh of organization data
  refreshOrganization(): void {
    this.initializeCurrentOrganization();
  }
}
