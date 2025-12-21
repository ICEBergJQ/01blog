import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { InteractionService } from '../../services/interaction.service';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { PostCardComponent } from '../../components/post-card/post-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="container" *ngIf="user">
        <div class="card mb-4 shadow-sm">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h2>{{ user.username }}</h2>
                    <p class="text-muted">{{ user.email }}</p> 
                    <span class="badge bg-secondary">{{ user.role }}</span>
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

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private postService: PostService,
    private interactionService: InteractionService,
    private authService: AuthService,
    private reportService: ReportService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  reportUser() {
      const reason = prompt('Why are you reporting this user?');
      if (reason && this.user) {
          this.reportService.submitReport({
              reason,
              reportedUserId: this.user.id
          }).subscribe(() => alert('Report submitted.'));
      }
  }

  loadProfile(id: number) {
      this.userService.getUser(id).subscribe(user => {
          this.user = user;
          this.checkFollowStatus(id);
      });
      this.postService.getUserPosts(id).subscribe(posts => this.posts = posts);
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
      });
  }

  unfollow() {
      if (!this.user) return;
      this.interactionService.unfollowUser(this.user.id).subscribe(() => {
          this.isFollowing = false;
      });
  }

  onPostDeleted(postId: number) {
      this.posts = this.posts.filter(p => p.id !== postId);
  }
}
