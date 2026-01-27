import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminService, ReportResponse } from '../../services/admin.service';
import { PostService } from '../../services/post.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
        <h2 class="mb-4">Admin Dashboard</h2>
        
        <ul class="nav nav-tabs mt-4 mb-3">
            <li class="nav-item">
                <button class="nav-link" [class.active]="activeTab === 'reports'" (click)="activeTab = 'reports'">Reports</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">Users</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" [class.active]="activeTab === 'posts'" (click)="activeTab = 'posts'">Posts</button>
            </li>
        </ul>

        <!-- Reports Tab -->
        <div *ngIf="activeTab === 'reports'">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>{{ showResolved ? 'Resolved Reports' : 'Pending Reports' }}</h4>
                <div class="btn-group">
                    <button class="btn btn-sm" [class.btn-primary]="!showResolved" [class.btn-outline-primary]="showResolved" (click)="toggleReportView(false)">Pending</button>
                    <button class="btn btn-sm" [class.btn-primary]="showResolved" [class.btn-outline-primary]="!showResolved" (click)="toggleReportView(true)">Resolved</button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Reporter</th>
                            <th>Reported User</th>
                            <th>Post ID</th>
                            <th>Reason</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let report of reports">
                            <td>{{ report.id }}</td>
                            <td>{{ report.reporterUsername }}</td>
                            <td>
                                {{ report.reportedUsername || 'N/A' }}
                                <span *ngIf="report.reportedPostId" class="badge bg-secondary ms-1">Post Author</span>
                            </td>
                            <td>{{ report.reportedPostId || 'N/A' }}</td>
                            <td>{{ report.reason }}</td>
                            <td>{{ report.timestamp | date:'short' }}</td>
                            <td style="min-width: 200px;">
                                <div class="d-flex flex-wrap gap-2">
                                    <button class="btn btn-sm btn-danger" (click)="toggleBanUserFromReport(report)" *ngIf="report.reportedUserId && report.reportedUserEnabled" title="Ban User">
                                        <i class="bi bi-person-x"></i> Ban
                                    </button>
                                    <button class="btn btn-sm btn-success" (click)="toggleBanUserFromReport(report)" *ngIf="report.reportedUserId && !report.reportedUserEnabled" title="Unban User">
                                        <i class="bi bi-person-check"></i> Unban
                                    </button>
                                    
                                    <ng-container *ngIf="report.reportedPostId">
                                        <button class="btn btn-sm btn-secondary" (click)="toggleHidePost(report)" *ngIf="!report.postHidden" title="Hide Post">
                                            <i class="bi bi-eye-slash"></i> Hide
                                        </button>
                                        <button class="btn btn-sm btn-warning text-white" (click)="toggleHidePost(report)" *ngIf="report.postHidden" title="Unhide Post">
                                            <i class="bi bi-eye"></i> Unhide
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" (click)="deletePostFromReport(report)" title="Delete Post">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </ng-container>

                                    <button *ngIf="!showResolved" class="btn btn-sm btn-light border" (click)="dismiss(report.id)" title="Dismiss / Ignore">
                                        <i class="bi bi-x-circle"></i> Dismiss
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div *ngIf="reports.length === 0" class="alert alert-info">No {{ showResolved ? 'resolved' : 'pending' }} reports.</div>
            
            <div class="d-flex justify-content-between align-items-center mt-3" *ngIf="totalPagesReports > 1">
                <button class="btn btn-sm btn-outline-secondary" (click)="changePageReports(-1)" [disabled]="pageReports === 0">Previous</button>
                <span>Page {{ pageReports + 1 }} of {{ totalPagesReports }}</span>
                <button class="btn btn-sm btn-outline-secondary" (click)="changePageReports(1)" [disabled]="pageReports >= totalPagesReports - 1">Next</button>
            </div>
        </div>

        <!-- Users Tab -->
        <div *ngIf="activeTab === 'users'">
            <h4>All Users</h4>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let user of users">
                            <td>{{ user.id }}</td>
                            <td>{{ user.username }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.role }}</td>
                            <td>
                                <span class="badge" [class.bg-success]="user.enabled" [class.bg-danger]="!user.enabled">
                                    {{ user.enabled ? 'Active' : 'Banned' }}
                                </span>
                            </td>
                            <td>
                                <button *ngIf="user.enabled" class="btn btn-sm btn-danger me-2" (click)="banUser(user)" [disabled]="user.role === 'ADMIN'">Ban</button>
                                <button *ngIf="!user.enabled" class="btn btn-sm btn-success me-2" (click)="unbanUser(user)">Unban</button>
                                <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(user)" [disabled]="user.role === 'ADMIN'">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mt-3" *ngIf="totalPagesUsers > 1">
                <button class="btn btn-sm btn-outline-secondary" (click)="changePageUsers(-1)" [disabled]="pageUsers === 0">Previous</button>
                <span>Page {{ pageUsers + 1 }} of {{ totalPagesUsers }}</span>
                <button class="btn btn-sm btn-outline-secondary" (click)="changePageUsers(1)" [disabled]="pageUsers >= totalPagesUsers - 1">Next</button>
            </div>
        </div>

        <!-- Posts Tab -->
        <div *ngIf="activeTab === 'posts'">
            <h4>All Posts</h4>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Author</th>
                            <th>Content Snippet</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let post of allPosts">
                            <td>{{ post.id }}</td>
                            <td>{{ post.username }}</td>
                            <td>{{ post.content | slice:0:50 }}...</td>
                            <td>{{ post.timestamp | date:'short' }}</td>
                            <td>
                                <span class="badge bg-secondary" *ngIf="post.hidden">HIDDEN</span>
                                <span class="badge bg-success" *ngIf="!post.hidden">VISIBLE</span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-secondary me-2" (click)="toggleHidePostFromList(post)" *ngIf="!post.hidden" title="Hide Post">
                                    <i class="bi bi-eye-slash"></i> Hide
                                </button>
                                <button class="btn btn-sm btn-warning me-2 text-white" (click)="toggleHidePostFromList(post)" *ngIf="post.hidden" title="Unhide Post">
                                    <i class="bi bi-eye"></i> Unhide
                                </button>
                                <button class="btn btn-sm btn-outline-danger" (click)="deletePostFromList(post.id)" title="Delete Post">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Use Load More for posts since we use cursor pagination for posts generally, 
                 but for Admin table offset is better.
                 Wait, PostService.getAllPosts uses CURSOR.
                 I need to either implement offset for admin posts or use Load More here.
                 Using Load More here to be consistent with PostService.
            -->
            <div class="text-center mt-3" *ngIf="hasMorePosts && allPosts.length > 0">
                <button class="btn btn-outline-secondary" (click)="loadAllPosts()" [disabled]="isLoadingPosts">
                    {{ isLoadingPosts ? 'Loading...' : 'Load More' }}
                </button>
            </div>
        </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  reports: ReportResponse[] = [];
  users: User[] = [];
  allPosts: Post[] = [];
  activeTab: 'reports' | 'users' | 'posts' = 'reports';
  
  pageReports = 0;
  pageUsers = 0;
  totalPagesReports = 0;
  totalPagesUsers = 0;
  pageSize = 10;

  // Post Pagination (Cursor)
  postsCursor: number | null = null;
  hasMorePosts = true;
  isLoadingPosts = false;

  showResolved = false;

  constructor(
      private adminService: AdminService,
      private postService: PostService,
      private toastService: ToastService,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
      if (isPlatformBrowser(this.platformId)) {
          this.loadReports();
          this.loadUsers();
          this.loadAllPosts(); // Preload or load on tab click? Preload is fine.
      }
  }

  loadReports() {
      // Note: simplified cursor handling for reports
      this.adminService.getAllReports(null, this.pageSize, this.showResolved).subscribe(res => {
          this.reports = res.content;
          this.totalPagesReports = 1; // Simplify since cursor logic is complex for pages
      });
  }

  toggleReportView(resolved: boolean) {
      this.showResolved = resolved;
      this.loadReports();
  }

  loadUsers() {
      this.adminService.getAllUsers(this.pageUsers, this.pageSize).subscribe(res => {
          this.users = res.content;
          this.totalPagesUsers = res.totalPages;
      });
  }

  loadAllPosts() {
      if (this.isLoadingPosts) return;
      this.isLoadingPosts = true;
      this.postService.getAllPosts(this.postsCursor, this.pageSize).subscribe({
          next: (res) => {
              this.allPosts = [...this.allPosts, ...res.content];
              this.hasMorePosts = res.hasMore;
              this.postsCursor = res.nextCursor;
              this.isLoadingPosts = false;
          },
          error: () => {
              this.toastService.show('Failed to load posts', 'error');
              this.isLoadingPosts = false;
          }
      });
  }

  changePageUsers(delta: number) {
      this.pageUsers += delta;
      this.loadUsers();
  }

  toggleBanUserFromReport(report: ReportResponse) {
      if (!report.reportedUserId) return;
      const isBanning = report.reportedUserEnabled !== false; // Default to true (enabled) if null
      
      const action = isBanning ? 'BAN' : 'UNBAN';
      if (!confirm(`Are you sure you want to ${action} ${report.reportedUsername}?`)) return;

      const apiCall = isBanning 
        ? this.adminService.banUser(report.reportedUserId)
        : this.adminService.unbanUser(report.reportedUserId);

      apiCall.subscribe({
          next: () => {
              report.reportedUserEnabled = !isBanning; // Toggle state immediately
              this.toastService.show(`User ${isBanning ? 'banned' : 'unbanned'}`, 'success');
              this.autoResolve(report.id);
          },
          error: (err) => this.toastService.show(err.error?.message || 'Action failed', 'error')
      });
  }

  banUser(user: User) {
      if (!confirm(`Are you sure you want to BAN ${user.username}?`)) return;
      this.adminService.banUser(user.id).subscribe({
          next: () => {
              user.enabled = false;
              this.toastService.show('User banned', 'success');
          },
          error: (err) => this.toastService.show(err.error?.message || 'Failed to ban user', 'error')
      });
  }

  unbanUser(user: User) {
      if (!confirm(`Are you sure you want to UNBAN ${user.username}?`)) return;
      this.adminService.unbanUser(user.id).subscribe({
          next: () => {
              user.enabled = true;
              this.toastService.show('User unbanned', 'success');
          },
          error: () => this.toastService.show('Failed to unban user', 'error')
      });
  }

  deleteUser(user: User) {
      if (!confirm(`Are you sure you want to DELETE ${user.username}? This cannot be undone and will delete all their data.`)) return;
      this.adminService.deleteUser(user.id).subscribe({
          next: () => {
              this.toastService.show('User deleted', 'warning');
              this.loadUsers();
          },
          error: (err) => this.toastService.show(err.error?.message || 'Failed to delete user', 'error')
      });
  }

  deletePost(postId: number) {
      if (!confirm('Delete this post?')) return;
      this.postService.deletePost(postId).subscribe({
          next: () => {
              this.toastService.show('Post deleted', 'warning');
              this.loadReports(); 
          },
          error: () => this.toastService.show('Failed to delete post', 'error')
      });
  }

  deletePostFromReport(report: ReportResponse) {
      if (!confirm('Delete this post?')) return;
      if (!report.reportedPostId) return;

      this.postService.deletePost(report.reportedPostId).subscribe({
          next: () => {
              this.toastService.show('Post deleted', 'warning');
              this.autoResolve(report.id);
          },
          error: () => this.toastService.show('Failed to delete post', 'error')
      });
  }

  deletePostFromList(postId: number) {
      if (!confirm('Delete this post?')) return;
      this.postService.deletePost(postId).subscribe({
          next: () => {
              this.toastService.show('Post deleted', 'warning');
              this.allPosts = this.allPosts.filter(p => p.id !== postId);
          },
          error: () => this.toastService.show('Failed to delete post', 'error')
      });
  }

  dismiss(id: number) {
      this.adminService.dismissReport(id).subscribe({
          next: () => {
              this.reports = this.reports.filter(r => r.id !== id);
              this.toastService.show('Report resolved', 'info');
          },
          error: () => this.toastService.show('Failed to resolve report', 'error')
      });
  }

  autoResolve(reportId: number) {
      // If we are in "Pending" view, resolve it so it disappears from the list.
      // If we are in "Resolved" view, no need to call API again (it's already resolved), 
      // just UI update happened.
      if (this.showResolved) return;

      this.adminService.dismissReport(reportId).subscribe({
          next: () => {
              this.reports = this.reports.filter(r => r.id !== reportId);
          }
          // Silent fail ok for auto-resolve
      });
  }

  toggleHidePost(report: ReportResponse) {
      if (!report.reportedPostId) return;
      
      const action = report.postHidden ? 'unhide' : 'hide';
      if (!confirm(`Are you sure you want to ${action} this post?`)) return;

      const action$ = report.postHidden 
        ? this.adminService.unhidePost(report.reportedPostId) 
        : this.adminService.hidePost(report.reportedPostId);

      action$.subscribe({
          next: () => {
              report.postHidden = !report.postHidden;
              this.toastService.show(report.postHidden ? 'Post hidden successfully' : 'Post visible now', 'success');
              this.autoResolve(report.id);
          },
          error: () => this.toastService.show('Action failed', 'error')
      });
  }

  toggleHidePostFromList(post: Post) {
      const action = post.hidden ? 'unhide' : 'hide';
      if (!confirm(`Are you sure you want to ${action} this post?`)) return;

      const action$ = post.hidden 
        ? this.adminService.unhidePost(post.id) 
        : this.adminService.hidePost(post.id);

      action$.subscribe({
          next: () => {
              post.hidden = !post.hidden;
              this.toastService.show(post.hidden ? 'Post hidden successfully' : 'Post visible now', 'success');
          },
          error: () => this.toastService.show('Action failed', 'error')
      });
  }
}
