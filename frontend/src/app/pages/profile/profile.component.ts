import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Added this
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { InteractionService } from '../../services/interaction.service';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { FileService } from '../../services/file.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { PostCardComponent } from '../../components/post-card/post-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent], // Added FormsModule here
  template: `
    <div class="container" *ngIf="user">
        <div class="card mb-4 shadow-sm">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="position-relative me-3" style="cursor: pointer;" (click)="triggerFileInput()" *ngIf="isOwner">
                        <img [src]="profileImageUrl" 
                             class="rounded-circle" 
                             style="width: 100px; height: 100px; object-fit: cover;">
                        <div class="position-absolute top-0 end-0 bg-white rounded-circle border shadow-sm d-flex justify-content-center align-items-center"
                             style="width: 30px; height: 30px; transform: translate(25%, -25%);">
                            <i class="bi bi-pencil text-primary" style="font-size: 0.8rem;"></i>
                        </div>
                        <input type="file" #fileInput (change)="onFileSelected($event)" hidden>
                        <div *ngIf="isUploading" class="position-absolute top-50 start-50 translate-middle spinner-border spinner-border-sm text-primary" role="status"></div>
                    </div>
                    <div class="position-relative me-3" *ngIf="!isOwner">
                         <img [src]="profileImageUrl" 
                             class="rounded-circle" 
                             style="width: 100px; height: 100px; object-fit: cover;">
                    </div>
                    <div>
                        <h2>{{ user.username }}</h2>
                        <div class="d-flex gap-3 mb-2 text-muted small">
                            <span><strong>{{ user.postsCount || 0 }}</strong> posts</span>
                            <span><strong>{{ user.followersCount || 0 }}</strong> followers</span>
                            <span><strong>{{ user.followingCount || 0 }}</strong> following</span>
                        </div>
                        <p class="text-muted">{{ user.email }}</p> 
                        <span class="badge bg-secondary mb-2">{{ user.role }}</span>
                        
                        <div *ngIf="!isEditingBio" class="d-flex align-items-center">
                            <p class="mb-1" *ngIf="user.bio" style="white-space: pre-wrap;">{{ user.bio }}</p>
                            <p class="text-muted fst-italic mb-1" *ngIf="!user.bio">No bio yet.</p>
                            <button *ngIf="isOwner" class="btn btn-sm btn-outline-primary ms-2" (click)="editBio()" title="Edit Bio">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div *ngIf="isEditingBio">
                            <textarea class="form-control mb-2" [(ngModel)]="editBioContent" rows="3" maxlength="200" placeholder="Max 200 characters"></textarea>
                            <button class="btn btn-sm btn-success me-2" (click)="saveBio()">Save</button>
                            <button class="btn btn-sm btn-secondary" (click)="cancelBioEdit()">Cancel</button>
                        </div>
                    </div>
                </div>
                <div *ngIf="currentUser && currentUser.id !== user.id">
                    <button class="btn btn-outline-warning me-2" (click)="reportUser()">Report</button>
                    <button *ngIf="!isFollowing" class="btn btn-primary" (click)="follow()">Follow</button>
                    <button *ngIf="isFollowing" class="btn btn-outline-danger" (click)="unfollow()">Unfollow</button>
                </div>
            </div>
        </div>

        <h3>Posts</h3>
        <div *ngFor="let post of posts">
            <app-post-card 
                [post]="post" 
                [currentUserId]="currentUser?.id || null"
                [isAdmin]="currentUser?.role === 'ADMIN'"
                (postDeleted)="onPostDeleted($event)"
            ></app-post-card>
        </div>
        <div *ngIf="posts.length === 0" class="text-center text-muted mt-4">
            No posts yet.
        </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  currentUser: User | null = null;
  posts: Post[] = [];
  isFollowing = false;
  isUploading = false;
  isEditingBio = false;
  editBioContent = '';
  profileImageUrl = 'assets/default-avatar.png'; // Local property for the URL

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private postService: PostService,
    private interactionService: InteractionService,
    private authService: AuthService,
    private reportService: ReportService,
    private fileService: FileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get isOwner(): boolean {
      return this.currentUser?.id === this.user?.id;
  }

  // Removed dynamic getter to fix NG0100
  // getFreshProfileUrl(...) 

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
        this.authService.getMe().subscribe(me => this.currentUser = me);
        this.route.paramMap.subscribe(params => {
            const id = Number(params.get('id'));
            if (id) {
                this.loadProfile(id);
            }
        });
    }
  }

  loadProfile(id: number) {
      this.userService.getUser(id).subscribe(user => {
          this.user = user;
          this.updateLocalProfileImageUrl(); // Update the URL once
          this.checkFollowStatus(id);
      });
      this.postService.getUserPosts(id).subscribe(posts => this.posts = posts);
  }

  updateLocalProfileImageUrl() {
      if (this.user?.profilePictureUrl) {
          this.profileImageUrl = 'http://localhost:8080' + this.user.profilePictureUrl + '?t=' + new Date().getTime();
      } else {
          this.profileImageUrl = 'assets/default-avatar.png';
      }
  }

  editBio() {
      this.isEditingBio = true;
      this.editBioContent = this.user?.bio || '';
  }

  cancelBioEdit() {
      this.isEditingBio = false;
  }

  saveBio() {
      this.userService.updateBio(this.editBioContent).subscribe(() => {
          if (this.user) {
              this.user.bio = this.editBioContent;
          }
          this.isEditingBio = false;
      });
  }

  triggerFileInput() {
      if (this.isOwner) {
          const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
          fileInput?.click();
      }
  }

  onFileSelected(event: any) {
      const file: File = event.target.files[0];
      if (file) {
          this.isUploading = true;
          this.fileService.uploadFile(file).subscribe({
              next: (res) => {
                  this.updateProfilePicture(res.fileUrl);
              },
              error: () => {
                  this.isUploading = false;
                  alert('Upload failed');
              }
          });
      }
  }

    updateProfilePicture(url: string) {
        this.userService.updateProfilePicture(url).subscribe(() => {
            if (this.user) {
                this.loadProfile(this.user.id);
                window.location.reload(); 
            }
            this.isUploading = false;
        });
    }
  checkFollowStatus(userId: number) {
      this.interactionService.getFollowStatus(userId).subscribe(status => {
          this.isFollowing = status.following;
      });
  }

  follow() {
      if (!this.user) return;
      this.interactionService.followUser(this.user.id).subscribe(() => {
          this.isFollowing = true;
          if (this.user && this.user.followersCount !== undefined) {
              this.user.followersCount++;
          }
      });
  }

  unfollow() {
      if (!this.user) return;
      this.interactionService.unfollowUser(this.user.id).subscribe(() => {
          this.isFollowing = false;
          if (this.user && this.user.followersCount !== undefined && this.user.followersCount > 0) {
              this.user.followersCount--;
          }
      });
  }

  reportUser() {
      let reason = prompt('Why are you reporting this user? (Max 500 chars)');
      if (reason && this.user) {
          if (reason.length > 500) reason = reason.substring(0, 500);
          this.reportService.submitReport({
              reason,
              reportedUserId: this.user.id
          }).subscribe(() => alert('Report submitted.'));
      }
  }

  onPostDeleted(postId: number) {
      this.posts = this.posts.filter(p => p.id !== postId);
  }
}