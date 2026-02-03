import { Injectable } from '@angular/core';

type JwtPayload = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token && token.trim().length > 0 ? token : null;
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const payload = this.decodePayload(token);
    if (!payload) {
      return false;
    }
    if (this.isExpired(payload)) {
      this.clearToken();
      return false;
    }
    return true;
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = this.decodePayload(token);
    if (!payload) {
      return null;
    }
    if (this.isExpired(payload)) {
      this.clearToken();
      return null;
    }
    return this.extractUserId(payload);
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = this.decodePayload(token);
    if (!payload) {
      return null;
    }
    if (this.isExpired(payload)) {
      this.clearToken();
      return null;
    }
    return this.extractRole(payload);
  }

  private decodePayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const payload = parts[1];
    const json = this.decodeBase64Url(payload);
    if (!json) {
      return null;
    }
    try {
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  private decodeBase64Url(value: string): string | null {
    try {
      const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
      const padLength = (4 - (normalized.length % 4)) % 4;
      const padded = normalized + '='.repeat(padLength);
      return atob(padded);
    } catch {
      return null;
    }
  }

  private isExpired(payload: JwtPayload): boolean {
    const exp = payload['exp'];
    if (typeof exp !== 'number') {
      return false;
    }
    return Date.now() >= exp * 1000;
  }

  private extractUserId(payload: JwtPayload): number | null {
    const candidates = [
      payload['userId'],
      payload['id'],
      payload['user_id'],
      payload['uid'],
      payload['sub']
    ];

    for (const value of candidates) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d+$/.test(trimmed)) {
          return Number(trimmed);
        }
      }
    }

    return null;
  }

  private extractRole(payload: JwtPayload): string | null {
    const value = payload['role'] ?? payload['roles'] ?? payload['authorities'] ?? payload['authority'];
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === 'string');
      return typeof first === 'string' ? first : null;
    }
    return typeof value === 'string' ? value : null;
  }
}
