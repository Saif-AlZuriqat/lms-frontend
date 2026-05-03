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

  register(userName: string, email: string, password: string,passwordConfirm: string, fullName: string) {
    return this.http.post(this.baseUrl + '/Register', {
      userName: userName,
      email: email,
      password: password,
      confirmPassword: passwordConfirm,
      fullName: fullName,
    });
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(this.baseUrl + '/Login', {
      Email: email,
      Password: password,
    });
  }

  createUser(payload: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName?: string;
    role?: 'Admin' | 'HR' | 'Employee';
  }) {
    return this.http.post(this.baseUrl + '/create-user', payload, { responseType: 'text' });
  }

  saveToken(token: string) {
    if (!token || token === 'undefined' || token === 'null') {
      return;
    }
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    const token = this.token || localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    return token;
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  getUserRole(): UserRole | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return null;
      }

      const normalizedBase64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = normalizedBase64.padEnd(Math.ceil(normalizedBase64.length / 4) * 4, '=');
      const jsonPayload = JSON.parse(atob(paddedBase64)) as Record<string, unknown>;

      const possibleRoleValues: unknown[] = [];
      for (const [key, value] of Object.entries(jsonPayload)) {
        const normalizedKey = key.toLowerCase();
        if (
          normalizedKey === 'role' ||
          normalizedKey === 'roles' ||
          normalizedKey.endsWith('/role') ||
          normalizedKey.includes('claims/role')
        ) {
          possibleRoleValues.push(value);
        }
      }

      const normalizedRoles = possibleRoleValues
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string')
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      if (normalizedRoles.some((role) => role.toLowerCase() === 'admin')) {
        return 'Admin';
      }
      if (normalizedRoles.some((role) => role.toLowerCase() === 'hr')) {
        return 'HR';
      }
      if (normalizedRoles.some((role) => role.toLowerCase() === 'employee')) {
        return 'Employee';
      }
    } catch {
      return null;
    }

    return null;
  }

  getUserId(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
      // ASP.NET Core Identity puts user ID in sub or nameidentifier
      return String(
        payload['sub'] ??
        payload['nameid'] ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
        ''
      );
    } catch {
      return '';
    }
  }

  getUserName(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
      // ASP.NET Core name claims
      const nameClaim =
        (payload['name'] as string) ||
        (payload['unique_name'] as string) ||
        (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string) ||
        (payload['email'] as string) ||
        '';
      // If it looks like an email, take the part before @
      const raw = nameClaim.includes('@') ? nameClaim.split('@')[0] : nameClaim;
      // Capitalize first letter
      return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '';
    } catch {
      return '';
    }
  }

  hasAnyRole(roles: UserRole[]) {
    const role = this.getUserRole();
    return role ? roles.includes(role) : false;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }
}
