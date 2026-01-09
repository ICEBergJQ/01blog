import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { FileService } from '../../services/file.service';
import { Post } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent],
  template: `
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <form (ngSubmit)="createPost()">
                        <div class="mb-3">
                            <textarea class="form-control" rows="3" placeholder="What did you learn today?" [(ngModel)]="newPostContent" name="content" required></textarea>
                        </div>
                        <div class="mb-3">
                             <label class="form-label btn btn-sm btn-outline-secondary">
                                <i class="bi bi-paperclip"></i> Attach Media
                                <input type="file" (change)="onFileSelected($event)" hidden>
                             </label>
                             <span *ngIf="selectedFile" class="ms-2 small text-muted">{{ selectedFile.name }}</span>
                             <div *ngIf="isUploading" class="spinner-border spinner-border-sm text-primary ms-2" role="status"></div>
                        </div>
                        
                        <!-- Media Preview -->
                        <div *ngIf="uploadedFileUrl && uploadedMediaType !== 'NONE'" class="mb-3 position-relative d-inline-block">
                            <img *ngIf="uploadedMediaType === 'IMAGE'" [src]="uploadedFileUrl" class="img-thumbnail" style="max-height: 150px;">
                            <video *ngIf="uploadedMediaType === 'VIDEO'" [src]="uploadedFileUrl" controls class="img-thumbnail" style="max-height: 150px;"></video>
                            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" (click)="clearMedia()">&times;</button>
                        </div>

                        <div class="d-flex justify-content-end">
                            <button type="submit" class="btn btn-primary" [disabled]="!newPostContent.trim() || isUploading">Post</button>
                        </div>
                    </form>
                </div>
            </div>

            <div *ngFor="let post of posts">
                <app-post-card 
                    [post]="post" 
                    [currentUserId]="currentUser?.id || null"
                    [isAdmin]="currentUser?.role === 'ADMIN'"
                    (postDeleted)="onPostDeleted($event)"
                    (postEdited)="onPostEdited($event)"
                ></app-post-card>
            </div>
        </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  currentUser: User | null = null;
  newPostContent = '';
  selectedFile: File | null = null;
  uploadedFileUrl: string | null = null;
  uploadedMediaType: string = 'NONE';
  isUploading = false;

  constructor(
      private postService: PostService,
      private authService: AuthService,
      private fileService: FileService,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
      if (isPlatformBrowser(this.platformId)) {
          this.loadUser();
          this.loadPosts();
      }
  }

  loadUser() {
      this.authService.getMe().subscribe(user => this.currentUser = user);
  }

  loadPosts() {
      this.postService.getAllPosts().subscribe(posts => this.posts = posts);
  }

  onFileSelected(event: any) {
      const file: File = event.target.files[0];
      if (file) {
          this.selectedFile = file;
          
          // Create local preview URL immediately
          const reader = new FileReader();
          reader.onload = (e: any) => {
              this.uploadedFileUrl = e.target.result; // Temporarily show local blob
              if (file.type.startsWith('image/')) this.uploadedMediaType = 'IMAGE';
              else if (file.type.startsWith('video/')) this.uploadedMediaType = 'VIDEO';
          };
          reader.readAsDataURL(file);

          this.isUploading = true;
          this.fileService.uploadFile(file).subscribe({
              next: (response) => {
                  this.uploadedFileUrl = 'http://localhost:8080' + response.fileUrl; // Update with real server URL
                  this.isUploading = false;
              },
              error: () => {
                  alert('File upload failed');
                  this.isUploading = false;
                  this.selectedFile = null;
                  this.uploadedFileUrl = null;
                  this.uploadedMediaType = 'NONE';
              }
          });
      }
  }

  createPost() {
      if (!this.newPostContent.trim()) return;

      const postData = {
          content: this.newPostContent,
          mediaUrl: this.uploadedFileUrl,
          mediaType: this.uploadedMediaType === 'NONE' ? null : this.uploadedMediaType
      };

      this.postService.createPost(postData).subscribe(post => {
          this.posts.unshift(post);
          this.newPostContent = '';
          this.selectedFile = null;
          this.uploadedFileUrl = null;
          this.uploadedMediaType = 'NONE';
      });
  }

  onPostDeleted(postId: number) {
      this.posts = this.posts.filter(p => p.id !== postId);
  }

  onPostEdited(updatedPost: Post) {
      this.posts = this.posts.map(p => p.id === updatedPost.id ? updatedPost : p);
  }

  clearMedia() {
      this.selectedFile = null;
      this.uploadedFileUrl = null;
      this.uploadedMediaType = 'NONE';
  }
}
