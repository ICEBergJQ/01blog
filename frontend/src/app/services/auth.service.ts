import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<string | null>;

  constructor(
      private http: HttpClient, 
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {
      this.currentUserSubject = new BehaviorSubject<string | null>(this.getToken());
  }

  register(user: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  private handleAuth(response: AuthResponse) {
    if (response.token && isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', response.token);
      this.currentUserSubject.next(response.token);
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
        return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      return null;
    }
  }
  
  get currentUser$() {
      return this.currentUserSubject.asObservable();
  }
}
