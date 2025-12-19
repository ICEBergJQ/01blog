import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportRequest {
    reason: string;
    reportedUserId?: number;
    reportedPostId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  submitReport(report: ReportRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, report);
  }
}
