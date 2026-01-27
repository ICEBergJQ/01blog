import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface ReportResponse {
    id: number;
    reason: string;
    timestamp: string;
    reporterUsername: string;
    reportedUsername: string;
    reportedUserId?: number;
    reportedPostId?: number;
    postHidden?: boolean;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getAllReports(cursor: number | null = null, size: number = 10): Observable<any> {
    const url = cursor ? `${this.apiUrl}/reports?cursor=${cursor}&size=${size}` : `${this.apiUrl}/reports?size=${size}`;
    return this.http.get<any>(url);
  }

  getAllUsers(page: number = 0, size: number = 10): Observable<PageResponse<User>> {
    return this.http.get<PageResponse<User>>(`${this.apiUrl}/users?page=${page}&size=${size}`);
  }

  banUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/ban`, {});
  }

  unbanUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/unban`, {});
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  hidePost(postId: number): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/posts/${postId}/hide`, {});
  }

  unhidePost(postId: number): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/posts/${postId}/unhide`, {});
  }

  dismissReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reports/${reportId}`);
  }
}