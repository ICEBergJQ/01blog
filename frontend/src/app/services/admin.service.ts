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

import { PageResponse } from './post.service';

// ...

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getAllReports(page: number = 0, size: number = 10): Observable<PageResponse<ReportResponse>> {
    return this.http.get<PageResponse<ReportResponse>>(`${this.apiUrl}/reports?page=${page}&size=${size}`);
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
