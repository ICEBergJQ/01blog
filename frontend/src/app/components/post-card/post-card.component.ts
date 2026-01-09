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
  template: `
    <div class="card mb-3 shadow-sm" [class.border-warning]="post.hidden">
      <div class="card-header d-flex justify-content-between align-items-center bg-white">
        <div class="d-flex align-items-center">
            <div class="fw-bold me-2">
                <a [routerLink]="['/profile', post.userId]" class="text-decoration-none text-dark">
                    {{ post.username }}
                </a>
            </div>
            <small class="text-muted">{{ post.timestamp | date:'short' }}</small>
        </div>
        <div>
            <span *ngIf="post.hidden" class="badge bg-warning text-dark me-2">HIDDEN</span>
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
            <p class="card-text">{{ post.content }}</p>
            <div *ngIf="post.mediaUrl" class="mb-3">
                <img [src]="post.mediaUrl" class="img-fluid rounded" alt="Post media" *ngIf="post.mediaType === 'IMAGE'">
                <video [src]="post.mediaUrl" controls class="img-fluid rounded" *ngIf="post.mediaType === 'VIDEO'"></video>
            </div>
        </div>
        <div *ngIf="isEditing">
            <textarea class="form-control mb-2" [(ngModel)]="editContent"></textarea>
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-secondary" (click)="cancelEdit()">Cancel</button>
                <button class="btn btn-sm btn-success" (click)="saveEdit()">Save</button>
            </div>
        </div>
        
        <div class="d-flex gap-3 border-top pt-3">
            <button class="btn btn-sm" [class.btn-primary]="isLiked" [class.btn-outline-primary]="!isLiked" (click)="toggleLike()">
                <i class="bi bi-hand-thumbs-up"></i> {{ isLiked ? 'Liked' : 'Like' }} ({{ likeCount }})
            </button>
            <button class="btn btn-sm btn-outline-secondary" (click)="toggleComments()">
                <i class="bi bi-chat"></i> Comments
            </button>
        </div>

        <div *ngIf="showComments" class="mt-3">
            <div class="list-group mb-3">
                <div *ngFor="let comment of comments" class="list-group-item">
                    <div class="d-flex justify-content-between">
                        <strong>
                            <a [routerLink]="['/profile', comment.userId]" class="text-decoration-none text-dark">
                                {{ comment.username }}
                            </a>
                        </strong>
                        <small class="text-muted">{{ comment.timestamp | date:'short' }}</small>
                    </div>
                    <p class="mb-0">{{ comment.content }}</p>
                    <button *ngIf="comment.userId === currentUserId" class="btn btn-link btn-sm text-danger p-0 mt-1" (click)="deleteComment(comment.id)">Delete</button>
                </div>
            </div>
            <form (ngSubmit)="addComment()" class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm" placeholder="Write a comment..." [(ngModel)]="newComment" name="newComment" required>
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
      if (!this.editContent.trim()) return;
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
      const reason = prompt('Why are you reporting this post?');
      if (reason) {
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
