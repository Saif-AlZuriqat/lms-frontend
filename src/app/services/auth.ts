import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
    return this.http.post<{ Token: string; Expiration: string }>(this.baseUrl + '/Login', {
      Email: email,
      Password: password,
    });
  }

  saveToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  isLoggedIn() {
    return this.getToken() !== null;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }
}
