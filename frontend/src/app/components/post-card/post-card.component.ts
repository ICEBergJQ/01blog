import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../models/post.model';
import { Comment } from '../../models/comment.model';
import { InteractionService } from '../../services/interaction.service';
import { PostService } from '../../services/post.service';
import { ReportService } from '../../services/report.service';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [
    `
    .comments-container {
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 1rem;
        padding-right: 5px;
    }
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
            <button *ngIf="isOwner && !isEditing && !post.hidden" class="btn btn-sm btn-outline-primary me-1" (click)="enableEdit()">
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
            <div *ngIf="post.mediaUrl" class="mb-3 text-center bg-light rounded overflow-hidden">
                <img [src]="post.mediaUrl" class="img-fluid" alt="Post media" *ngIf="post.mediaType === 'IMAGE'" style="max-height: 450px; object-fit: contain;">
                <video [src]="post.mediaUrl" controls class="img-fluid" *ngIf="post.mediaType === 'VIDEO'" style="max-height: 450px; width: 100%;"></video>
            </div>
        </div>
        <div *ngIf="isEditing">
            <textarea class="form-control mb-2" [(ngModel)]="editContent" maxlength="2000" rows="4"></textarea>
            <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted">{{ editContent.length }}/2000 characters</small>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-secondary" (click)="cancelEdit()">Cancel</button>
                    <button class="btn btn-sm btn-success" (click)="saveEdit()" [disabled]="!editContent.trim() && !post.mediaUrl">Save</button>
                </div>
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

    <!-- Report Modal moved outside card -->
    <div *ngIf="isReportModalOpen">
        <div class="modal-backdrop fade show" style="background: rgba(0,0,0,0.5); z-index: 2000;"></div>
        <div class="modal d-block" tabindex="-1" style="z-index: 2050;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Report Post</h5>
                <button type="button" class="btn-close" (click)="closeReportModal()"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label for="reportReason" class="form-label">Why are you reporting this post?</label>
                    <textarea class="form-control" id="reportReason" rows="3" [(ngModel)]="reportReason" maxlength="100" placeholder="Max 100 characters..."></textarea>
                    <div class="text-end text-muted small mt-1">{{ reportReason.length }}/100</div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeReportModal()">Cancel</button>
                <button type="button" class="btn btn-danger" (click)="submitReport()" [disabled]="!reportReason.trim()">Submit Report</button>
            </div>
            </div>
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

  // Report Modal
  isReportModalOpen = false;
  reportReason = '';

  constructor(
      private interactionService: InteractionService,
      private postService: PostService,
      private reportService: ReportService,
      private adminService: AdminService,
      private toastService: ToastService
  ) {}

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

      get canDelete(): boolean {
        return (this.currentUserId === this.post.userId || this.isAdmin) && (!this.post.hidden || this.isAdmin);
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
      
      this.postService.updatePost(this.post.id, updateData).subscribe({
          next: (updatedPost) => {
              this.post = updatedPost;
              this.isEditing = false;
              this.postEdited.emit(updatedPost);
              this.toastService.show('Post updated successfully', 'success');
          },
          error: () => this.toastService.show('Failed to update post', 'error')
      });
  }

  hidePost() {
      if(!confirm('Are you sure you want to hide this post?')) return;
      this.adminService.hidePost(this.post.id).subscribe({
          next: () => {
              this.post.hidden = true;
              this.toastService.show('Post hidden successfully', 'success');
          },
          error: () => this.toastService.show('Failed to hide post', 'error')
      });
  }

  unhidePost() {
      if(!confirm('Unhide this post?')) return;
      this.adminService.unhidePost(this.post.id).subscribe({
          next: () => {
              this.post.hidden = false;
              this.toastService.show('Post visible', 'success');
          },
          error: () => this.toastService.show('Failed to unhide post', 'error')
      });
  }

  reportPost() {
      this.isReportModalOpen = true;
      this.reportReason = '';
  }

  closeReportModal() {
      this.isReportModalOpen = false;
      this.reportReason = '';
  }

  submitReport() {
      if (this.reportReason && this.reportReason.trim()) {
          this.reportService.submitReport({
              reason: this.reportReason.trim(),
              reportedPostId: this.post.id
          }).subscribe({
              next: () => {
                  this.toastService.show('Report submitted', 'success');
                  this.closeReportModal();
              },
              error: () => this.toastService.show('Failed to submit report', 'error')
          });
      }
  }

  loadLikeStatus() {
      this.interactionService.getLikeCount(this.post.id).subscribe(count => this.likeCount = count);
      this.interactionService.getLikeStatus(this.post.id).subscribe(status => this.isLiked = status.liked);
  }

  toggleLike() {
      this.interactionService.toggleLike(this.post.id).subscribe({
          next: () => {
              this.isLiked = !this.isLiked;
              this.likeCount += this.isLiked ? 1 : -1;
              if (this.isLiked) this.toastService.show('Post liked', 'success');
          },
          error: () => this.toastService.show('Failed to like post', 'error')
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
      this.interactionService.addComment(this.post.id, this.newComment).subscribe({
          next: (comment) => {
              this.comments.push(comment);
              this.newComment = '';
              this.toastService.show('Comment added', 'success');
          },
          error: () => this.toastService.show('Failed to add comment', 'error')
      });
  }

  deleteComment(commentId: number) {
      if (!confirm('Delete this comment?')) return;
      this.interactionService.deleteComment(commentId).subscribe({
          next: () => {
              this.comments = this.comments.filter(c => c.id !== commentId);
              this.toastService.show('Comment deleted', 'warning');
          },
          error: () => this.toastService.show('Failed to delete comment', 'error')
      });
  }

  deletePost() {
      if (!confirm('Delete this post?')) return;
      this.postService.deletePost(this.post.id).subscribe({
          next: () => {
              this.postDeleted.emit(this.post.id);
              this.toastService.show('Post deleted', 'warning');
          },
          error: () => this.toastService.show('Failed to delete post', 'error')
      });
  }
}