import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportResponse {
    id: number;
    reason: string;
    timestamp: string;
    reporterUsername: string;
    reportedUsername: string;
    reportedUserId?: number;
    reportedPostId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getAllReports(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/reports`);
  }

  banUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/ban`, {});
  }

  dismissReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reports/${reportId}`);
  }
}
