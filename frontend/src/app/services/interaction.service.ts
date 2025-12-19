import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  toggleLike(postId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/interactions/like/${postId}`, {});
  }

  getLikeCount(postId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/interactions/like/${postId}/count`);
  }

  getLikeStatus(postId: number): Observable<{liked: boolean}> {
    return this.http.get<{liked: boolean}>(`${this.apiUrl}/interactions/like/${postId}/status`);
  }

  getFollowStatus(userId: number): Observable<{following: boolean}> {
      return this.http.get<{following: boolean}>(`${this.apiUrl}/interactions/follow/${userId}/status`);
  }

  followUser(userId: number): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/interactions/follow/${userId}`, {});
  }

  unfollowUser(userId: number): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/interactions/unfollow/${userId}`, {});
  }

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/post/${postId}`);
  }

  addComment(postId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, { postId, content });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
}
