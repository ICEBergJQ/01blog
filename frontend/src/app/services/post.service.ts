import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

export interface CursorResponse<T> {
    content: T[];
    nextCursor: number | null;
    hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient) {}

  getAllPosts(cursor: number | null = null, size: number = 10): Observable<CursorResponse<Post>> {
    const url = cursor ? `${this.apiUrl}?cursor=${cursor}&size=${size}` : `${this.apiUrl}?size=${size}`;
    return this.http.get<CursorResponse<Post>>(url);
  }

  getUserPosts(userId: number, cursor: number | null = null, size: number = 10): Observable<CursorResponse<Post>> {
    const url = cursor ? `${this.apiUrl}/user/${userId}?cursor=${cursor}&size=${size}` : `${this.apiUrl}/user/${userId}?size=${size}`;
    return this.http.get<CursorResponse<Post>>(url);
  }

  createPost(post: any): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post);
  }

  updatePost(id: number, post: any): Observable<Post> {
      return this.http.put<Post>(`${this.apiUrl}/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
