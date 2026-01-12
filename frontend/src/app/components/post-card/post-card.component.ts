import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../models/post.model';
import { Comment } from '../../models/comment.model';
import { InteractionService } from '../../services/interaction.service';
import { PostService } from '../../services/post.service';
import { ReportService } from '../../services/report.service';
import { AdminService } from '../../services/admin.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .comments-container {
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 1rem;
        padding-right: 5px;
    }
    /* Simple scrollbar styling */
    .comments-container::-webkit-scrollbar {
        width: 4px;
    }
    .comments-container::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
    }
  `],
  template: `
    <div class="card mb-3 shadow-sm" [class.border-warning]="post.hidden">
      <div class="card-header d-flex justify-content-between align-items-center bg-white">
        <div class="d-flex align-items-center">
            <img [src]="post.userProfilePictureUrl ? 'http://localhost:8080' + post.userProfilePictureUrl : 'assets/default-avatar.png'" 
                 class="rounded-circle me-2" 
                 style="width: 40px; height: 40px; object-fit: cover;">
            <div>
                <div class="fw-bold">
                    <a [routerLink]="['/profile', post.userId]" class="text-decoration-none text-dark">
                        {{ post.username }}
                    </a>
                </div>
                <small class="text-muted" style="font-size: 0.8rem;">{{ post.timestamp | date:'short' }}</small>
            </div>
        </div>
        <div>
            <span *ngIf="post.hidden" class="badge bg-secondary me-2">HIDDEN</span>
            <button class="btn btn-sm btn-outline-warning me-1" (click)="reportPost()" *ngIf="currentUserId && currentUserId !== post.userId">
                <i class="bi bi-flag"></i>
            </button>
            <button *ngIf="isAdmin && !post.hidden" class="btn btn-sm btn-outline-secondary me-1" (click)="hidePost()">
                <i class="bi bi-eye-slash"></i>
            </button>
            <button *ngIf="isAdmin && post.hidden" class="btn btn-sm btn-outline-secondary me-1" (click)="unhidePost()">
                <i class="bi bi-eye"></i>
            </button>
            <button *ngIf="isOwner && !isEditing" class="btn btn-sm btn-outline-primary me-1" (click)="enableEdit()">
                <i class="bi bi-pencil"></i>
            </button>
            <button *ngIf="canDelete" class="btn btn-sm btn-outline-danger" (click)="deletePost()">
                &times;
            </button>
        </div>
      </div>
      <div class="card-body" [class.opacity-50]="post.hidden">
        <div *ngIf="!isEditing">
            <p class="card-text" style="white-space: pre-wrap;">{{ displayContent }}<a href="#" *ngIf="shouldShowSeeMore" (click)="$event.preventDefault(); isExpanded = !isExpanded" class="text-decoration-none ms-1">{{ isExpanded ? 'See less' : 'See more' }}</a></p>
            <div *ngIf="post.mediaUrl" class="mb-3">
                <img [src]="post.mediaUrl" class="img-fluid rounded" alt="Post media" *ngIf="post.mediaType === 'IMAGE'">
                <video [src]="post.mediaUrl" controls class="img-fluid rounded" *ngIf="post.mediaType === 'VIDEO'"></video>
            </div>
        </div>
        <div *ngIf="isEditing">
            <textarea class="form-control mb-2" [(ngModel)]="editContent"></textarea>
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-secondary" (click)="cancelEdit()">Cancel</button>
                <button class="btn btn-sm btn-success" (click)="saveEdit()" [disabled]="!editContent.trim() && !post.mediaUrl">Save</button>
            </div>
        </div>
        
        <div class="d-flex gap-3 border-top pt-3">
            <button class="btn btn-sm" [class.btn-primary]="isLiked" [class.btn-outline-primary]="!isLiked" (click)="toggleLike()" [disabled]="post.hidden">
                <i class="bi bi-hand-thumbs-up"></i> {{ isLiked ? 'Liked' : 'Like' }} ({{ likeCount }})
            </button>
            <button class="btn btn-sm btn-outline-secondary" (click)="toggleComments()" [disabled]="post.hidden">
                <i class="bi bi-chat"></i> Comments
            </button>
        </div>

        <div *ngIf="showComments" class="mt-3">
            <div class="list-group mb-3 comments-container">
                <div *ngFor="let comment of comments" class="list-group-item">
                    <div class="d-flex justify-content-between">
                        <div class="d-flex align-items-center">
                            <img [src]="comment.userProfilePictureUrl ? 'http://localhost:8080' + comment.userProfilePictureUrl : 'assets/default-avatar.png'" 
                                 class="rounded-circle me-2" 
                                 style="width: 25px; height: 25px; object-fit: cover;">
                            <strong>
                                <a [routerLink]="['/profile', comment.userId]" class="text-decoration-none text-dark">
                                    {{ comment.username }}
                                </a>
                            </strong>
                        </div>
                        <small class="text-muted">{{ comment.timestamp | date:'short' }}</small>
                    </div>
                    <div class="mb-0 mt-1 ms-5" style="white-space: pre-wrap;">
                        <span *ngIf="expandedComments.has(comment.id) || !shouldShowSeeMoreComment(comment)">{{ comment.content }}</span>
                        <span *ngIf="!expandedComments.has(comment.id) && shouldShowSeeMoreComment(comment)">{{ truncateText(comment.content) + '...' }}</span>
                        <a href="#" *ngIf="shouldShowSeeMoreComment(comment)" (click)="$event.preventDefault(); toggleCommentExpand(comment.id)" class="text-decoration-none ms-1">
                            {{ expandedComments.has(comment.id) ? 'See less' : 'See more' }}
                        </a>
                    </div>
                    <button *ngIf="comment.userId === currentUserId" class="btn btn-link btn-sm text-danger p-0 mt-1 ms-5" (click)="deleteComment(comment.id)">Delete</button>
                </div>
            </div>
            <form (ngSubmit)="addComment()" class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm" placeholder="Write a comment... (Max 500 chars)" [(ngModel)]="newComment" name="newComment" required maxlength="500">
                <button type="submit" class="btn btn-sm btn-primary">Post</button>
            </form>
        </div>
      </div>
    </div>
  `
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Input() currentUserId: number | null = null;
  @Input() isAdmin: boolean = false;
  @Output() postDeleted = new EventEmitter<number>();
  @Output() postEdited = new EventEmitter<Post>();

  isLiked = false;
  likeCount = 0;
  showComments = false;
  comments: Comment[] = [];
  newComment = '';
  
  isEditing = false;
  editContent = '';
  isExpanded = false;
  readonly contentLimit = 200;
  expandedComments = new Set<number>();

  get shouldShowSeeMore(): boolean {
      if (!this.post.content) return false;
      return this.post.content.length > this.contentLimit || this.post.content.split('\n').length > 5;
  }

  get displayContent(): string {
      if (!this.post.content) return '';
      if (this.isExpanded || !this.shouldShowSeeMore) {
          return this.post.content;
      }
      return this.truncateText(this.post.content);
  }

  shouldShowSeeMoreComment(comment: Comment): boolean {
      if (!comment.content) return false;
      return comment.content.length > this.contentLimit || comment.content.split('\n').length > 5;
  }

  getCommentDisplayContent(comment: Comment): string {
      if (!comment.content) return '';
      if (this.expandedComments.has(comment.id) || !this.shouldShowSeeMoreComment(comment)) {
          return comment.content;
      }
      return this.truncateText(comment.content);
  }

  toggleCommentExpand(commentId: number) {
      if (this.expandedComments.has(commentId)) {
          this.expandedComments.delete(commentId);
      } else {
          this.expandedComments.add(commentId);
      }
  }

  truncateText(text: string): string {
      let snippet = text;
      const lines = snippet.split('\n');
      
      if (lines.length > 5) {
          snippet = lines.slice(0, 5).join('\n');
      }
      
      if (snippet.length > this.contentLimit) {
          snippet = snippet.slice(0, this.contentLimit);
      }
      
      return snippet + '...';
  }

  constructor(
      private interactionService: InteractionService,
      private postService: PostService,
      private reportService: ReportService,
      private adminService: AdminService
  ) {}

  get canDelete(): boolean {
      return this.currentUserId === this.post.userId || this.isAdmin;
  }

  get isOwner(): boolean {
      return this.currentUserId === this.post.userId;
  }

  ngOnInit() {
      this.loadLikeStatus();
  }

  enableEdit() {
      this.isEditing = true;
      this.editContent = this.post.content;
  }

  cancelEdit() {
      this.isEditing = false;
      this.editContent = '';
  }

  saveEdit() {
      if (!this.editContent.trim() && !this.post.mediaUrl) return;
      const updateData = {
          content: this.editContent,
          mediaUrl: this.post.mediaUrl,
          mediaType: this.post.mediaType
      };
      
      this.postService.updatePost(this.post.id, updateData).subscribe(updatedPost => {
          this.post = updatedPost;
          this.isEditing = false;
          this.postEdited.emit(updatedPost);
      });
  }

  hidePost() {
      if(!confirm('Hide this post?')) return;
      this.adminService.hidePost(this.post.id).subscribe(() => {
          this.post.hidden = true;
      });
  }

  unhidePost() {
      if(!confirm('Unhide this post?')) return;
      this.adminService.unhidePost(this.post.id).subscribe(() => {
          this.post.hidden = false;
      });
  }

  reportPost() {
      let reason = prompt('Why are you reporting this post? (Max 500 chars)');
      if (reason) {
          if (reason.length > 500) reason = reason.substring(0, 500);
          this.reportService.submitReport({
              reason,
              reportedPostId: this.post.id
          }).subscribe(() => alert('Report submitted.'));
      }
  }

  loadLikeStatus() {
      this.interactionService.getLikeCount(this.post.id).subscribe(count => this.likeCount = count);
      this.interactionService.getLikeStatus(this.post.id).subscribe(status => this.isLiked = status.liked);
  }

  toggleLike() {
      this.interactionService.toggleLike(this.post.id).subscribe(() => {
          this.isLiked = !this.isLiked;
          this.likeCount += this.isLiked ? 1 : -1;
      });
  }

  toggleComments() {
      this.showComments = !this.showComments;
      if (this.showComments && this.comments.length === 0) {
          this.loadComments();
      }
  }

  loadComments() {
      this.interactionService.getComments(this.post.id).subscribe(comments => this.comments = comments);
  }

  addComment() {
      if (!this.newComment.trim()) return;
      this.interactionService.addComment(this.post.id, this.newComment).subscribe(comment => {
          this.comments.push(comment);
          this.newComment = '';
      });
  }

  deleteComment(commentId: number) {
      if (!confirm('Delete this comment?')) return;
      this.interactionService.deleteComment(commentId).subscribe(() => {
          this.comments = this.comments.filter(c => c.id !== commentId);
      });
  }

  deletePost() {
      if (!confirm('Delete this post?')) return;
      this.postService.deletePost(this.post.id).subscribe(() => {
          this.postDeleted.emit(this.post.id);
      });
  }
}
