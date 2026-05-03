import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type UserRole = 'Admin' | 'HR' | 'Employee';

export type LoginResponse = {
  Token?: string;
  token?: string;
  Expiration?: string;
  expiration?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5232/api/User';
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  register(
    userName: string,
    email: string,
    password: string,
    passwordConfirm: string,
    fullName: string
  ) {
    return this.http.post(`${this.baseUrl}/Register`, {
      userName,
      email,
      password,
      confirmPassword: passwordConfirm,
      fullName,
    });
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Login`, {
      email,
      password,
    });
  }

  createUser(payload: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName?: string;
    role?: UserRole;
  }) {
    return this.http.post(`${this.baseUrl}/create-user`, payload, {
      responseType: 'text',
    });
  }

  saveToken(token: string | undefined | null) {
    if (!this.isValidToken(token)) return;

    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    const token = this.token || localStorage.getItem('token');

    if (!this.isValidToken(token)) return null;

    return token;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getUserRole(): UserRole | null {
    const payload = this.getTokenPayload();

    if (!payload) return null;

    const roles: string[] = [];

    for (const [key, value] of Object.entries(payload)) {
      const normalizedKey = key.toLowerCase();

      if (
        normalizedKey === 'role' ||
        normalizedKey === 'roles' ||
        normalizedKey.endsWith('/role') ||
        normalizedKey.includes('claims/role')
      ) {
        if (Array.isArray(value)) {
          roles.push(...value.map(String));
        } else if (typeof value === 'string') {
          roles.push(...value.split(','));
        }
      }
    }

    const normalizedRoles = roles.map(r => r.trim().toLowerCase());

    if (normalizedRoles.includes('admin')) return 'Admin';
    if (normalizedRoles.includes('hr')) return 'HR';
    if (normalizedRoles.includes('employee')) return 'Employee';

    return null;
  }

  getUserId(): string {
    const payload = this.getTokenPayload();

    if (!payload) return '';

    return String(
      payload['sub'] ??
      payload['nameid'] ??
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
      ''
    );
  }

  getUserName(): string {
    const payload = this.getTokenPayload();

    if (!payload) return '';

    const nameClaim = String(
      payload['name'] ??
      payload['unique_name'] ??
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
      payload['email'] ??
      ''
    );

    const rawName = nameClaim.includes('@')
      ? nameClaim.split('@')[0]
      : nameClaim;

    return rawName
      ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
      : '';
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getUserRole();

    return userRole ? roles.includes(userRole) : false;
  }

  private getTokenPayload(): Record<string, unknown> | null {
    const token = this.getToken();

    if (!token) return null;

    try {
      const payloadPart = token.split('.')[1];

      if (!payloadPart) return null;

      const decodedPayload = this.decodeBase64Url(payloadPart);

      return JSON.parse(decodedPayload) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private decodeBase64Url(base64Url: string): string {
    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(base64Url.length / 4) * 4, '=');

    return atob(base64);
  }

  private isValidToken(token: string | null | undefined): token is string {
    return !!token && token !== 'undefined' && token !== 'null';
  }
}