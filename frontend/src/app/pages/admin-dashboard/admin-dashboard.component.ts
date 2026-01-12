import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminService, ReportResponse } from '../../services/admin.service';
import { PostService } from '../../services/post.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
        <h2>Admin Dashboard</h2>
        
        <ul class="nav nav-tabs mt-4 mb-3">
            <li class="nav-item">
                <button class="nav-link" [class.active]="activeTab === 'reports'" (click)="activeTab = 'reports'">Reports</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">Users</button>
            </li>
        </ul>

        <div *ngIf="activeTab === 'reports'">
            <h4>Reports</h4>
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
                                    <button class="btn btn-sm btn-danger" (click)="banUserFromReport(report)" *ngIf="report.reportedUserId" title="Ban User">
                                        <i class="bi bi-person-x"></i> Ban
                                    </button>
                                    
                                    <ng-container *ngIf="report.reportedPostId">
                                        <button class="btn btn-sm btn-secondary" (click)="toggleHidePost(report)" *ngIf="!report.postHidden" title="Hide Post">
                                            <i class="bi bi-eye-slash"></i> Hide
                                        </button>
                                        <button class="btn btn-sm btn-warning text-white" (click)="toggleHidePost(report)" *ngIf="report.postHidden" title="Unhide Post">
                                            <i class="bi bi-eye"></i> Unhide
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" (click)="deletePost(report.reportedPostId!)" title="Delete Post">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </ng-container>

                                    <button class="btn btn-sm btn-light border" (click)="dismiss(report.id)" title="Dismiss Report">
                                        <i class="bi bi-x-circle"></i> Dismiss
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div *ngIf="reports.length === 0" class="alert alert-info">No pending reports.</div>
            
            <div class="d-flex justify-content-between align-items-center mt-3" *ngIf="totalPagesReports > 1">
                <button class="btn btn-sm btn-outline-secondary" (click)="changePageReports(-1)" [disabled]="pageReports === 0">Previous</button>
                <span>Page {{ pageReports + 1 }} of {{ totalPagesReports }}</span>
                <button class="btn btn-sm btn-outline-secondary" (click)="changePageReports(1)" [disabled]="pageReports >= totalPagesReports - 1">Next</button>
            </div>
        </div>

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
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  reports: ReportResponse[] = [];
  users: User[] = [];
  activeTab: 'reports' | 'users' = 'reports';
  
  pageReports = 0;
  pageUsers = 0;
  totalPagesReports = 0;
  totalPagesUsers = 0;
  pageSize = 10;

  constructor(
      private adminService: AdminService,
      private postService: PostService,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
      if (isPlatformBrowser(this.platformId)) {
          this.loadReports();
          this.loadUsers();
      }
  }

  loadReports() {
      this.adminService.getAllReports(this.pageReports, this.pageSize).subscribe(res => {
          this.reports = res.content;
          this.totalPagesReports = res.totalPages;
      });
  }

  loadUsers() {
      this.adminService.getAllUsers(this.pageUsers, this.pageSize).subscribe(res => {
          this.users = res.content;
          this.totalPagesUsers = res.totalPages;
      });
  }

  changePageReports(delta: number) {
      this.pageReports += delta;
      this.loadReports();
  }

  changePageUsers(delta: number) {
      this.pageUsers += delta;
      this.loadUsers();
  }

  banUserFromReport(report: ReportResponse) {
      if (!confirm(`Are you sure you want to BAN ${report.reportedUsername}?`)) return;
      if (report.reportedUserId) {
          this.adminService.banUser(report.reportedUserId).subscribe(() => {
              alert('User banned.');
              this.reports = this.reports.filter(r => r.id !== report.id);
              this.loadUsers(); // Refresh users list
          });
      }
  }

  banUser(user: User) {
      if (!confirm(`Are you sure you want to BAN ${user.username}?`)) return;
      this.adminService.banUser(user.id).subscribe(() => {
          user.enabled = false;
      });
  }

  unbanUser(user: User) {
      if (!confirm(`Are you sure you want to UNBAN ${user.username}?`)) return;
      this.adminService.unbanUser(user.id).subscribe(() => {
          user.enabled = true;
      });
  }

  deletePost(postId: number) {
      if (!confirm('Delete this post?')) return;
      this.postService.deletePost(postId).subscribe(() => {
          alert('Post deleted.');
          this.loadReports(); 
      });
  }

  toggleHidePost(report: ReportResponse) {
      if (!report.reportedPostId) return;
      
      const action$ = report.postHidden 
        ? this.adminService.unhidePost(report.reportedPostId) 
        : this.adminService.hidePost(report.reportedPostId);

      action$.subscribe(() => {
          report.postHidden = !report.postHidden;
          // Ideally update all reports referencing same post, but this is fine for now
      });
  }

  dismiss(id: number) {
      this.adminService.dismissReport(id).subscribe(() => {
          this.reports = this.reports.filter(r => r.id !== id);
      });
  }
}