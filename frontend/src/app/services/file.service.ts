import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:8080/api/files';

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<{fileName: string, fileUrl: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{fileName: string, fileUrl: string}>(`${this.apiUrl}/upload`, formData);
  }

  uploadProfilePicture(file: File): Observable<{fileName: string, fileUrl: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{fileName: string, fileUrl: string}>(`${this.apiUrl}/upload-profile-picture`, formData);
  }
}
