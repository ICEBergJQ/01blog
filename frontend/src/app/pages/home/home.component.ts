import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Added import
import { PostService } from '../../services/post.service';
import { FileService } from '../../services/file.service';
import { Post } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent, RouterModule],
  template: `
    <div class="container-fluid px-lg-5"> <!-- Use container-fluid with side padding for wider look, removing excessive top margin -->
      <div class="row g-4 pt-3">
        <!-- Left Sidebar: Profile Snippet -->
        <div class="col-lg-3 d-none d-lg-block">
            <div class="card border-0 shadow-sm sticky-top" style="top: 90px;" *ngIf="currentUser">
                <div class="card-body text-center">
                    <img [src]="currentUser.profilePictureUrl ? 'http://localhost:8080' + currentUser.profilePictureUrl : 'assets/default-avatar.png'" 
                         class="rounded-circle mb-3 border" 
                         style="width: 90px; height: 90px; object-fit: cover;">
                    <h5 class="mb-1">{{ currentUser.username }}</h5>
                    <p class="text-muted small mb-3">{{ currentUser.bio || 'Digital Warrior' }}</p>
                    <div class="d-grid">
                        <a [routerLink]="['/profile', currentUser.id]" class="btn btn-outline-secondary btn-sm">View Profile</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Center Feed -->
        <div class="col-lg-6 col-md-12">
            <!-- Create Post Widget -->
            <div class="card border-0 shadow-sm mb-4" *ngIf="currentUser">
                <div class="card-body">
                    <form (ngSubmit)="createPost()">
                        <textarea class="form-control mb-3" rows="2" placeholder="Share your knowledge... (Max 2000 chars)" [(ngModel)]="newPostContent" name="content" style="resize: none;" maxlength="2000"></textarea>
                        
                        <div *ngIf="uploadedFileUrl" class="mb-3 position-relative d-inline-block">
                            <img *ngIf="uploadedMediaType === 'IMAGE'" [src]="uploadedFileUrl" class="rounded" style="max-height: 150px;">
                            <video *ngIf="uploadedMediaType === 'VIDEO'" [src]="uploadedFileUrl" controls class="rounded" style="max-height: 150px;"></video>
                            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle" (click)="clearMedia()" style="padding: 0 6px;">&times;</button>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                             <label class="btn btn-sm btn-light text-muted mb-0">
                                <i class="bi bi-image"></i> Media
                                <input type="file" (change)="onFileSelected($event)" hidden>
                             </label>
                             <button type="submit" class="btn btn-primary px-4" [disabled]="(!newPostContent.trim() && !uploadedFileUrl) || isUploading">POST</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Feed Stream -->
            <div *ngFor="let post of posts">
                <app-post-card 
                    [post]="post" 
                    [currentUserId]="currentUser?.id || null"
                    [isAdmin]="currentUser?.role === 'ADMIN'"
                    (postDeleted)="onPostDeleted($event)"
                    (postEdited)="onPostEdited($event)"
                ></app-post-card>
            </div>
            
            <div *ngIf="posts.length === 0" class="text-center py-5 text-muted">
                <div class="mb-3"><i class="bi bi-journal-x" style="font-size: 2rem;"></i></div>
                <p>The dojo is quiet. Be the first to speak.</p>
            </div>
        </div>

        <!-- Right Sidebar: Info -->
        <div class="col-lg-3 d-none d-lg-block">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <h6 class="card-title text-muted mb-3">DOJO RULES</h6>
                    <ul class="list-unstyled small mb-0">
                        <li class="mb-2"><i class="bi bi-check-circle me-2 text-success"></i>Respect the code.</li>
                        <li class="mb-2"><i class="bi bi-check-circle me-2 text-success"></i>Share wisdom.</li>
                        <li class="mb-0"><i class="bi bi-check-circle me-2 text-success"></i>Keep it clean.</li>
                    </ul>
                </div>
            </div>
            <div class="mt-4 text-center small text-muted">
                &copy; 2026 Dojo Platform
            </div>
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
      if (!this.newPostContent.trim() && !this.uploadedFileUrl) return;

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
