import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminService, ReportResponse } from '../../services/admin.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
        <h2>Admin Dashboard</h2>
        <h4 class="mt-4">Reports</h4>
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
                        <td>
                            <button class="btn btn-sm btn-danger me-2" (click)="banUser(report)" *ngIf="report.reportedUserId">Ban User</button>
                            <button class="btn btn-sm btn-warning me-2" (click)="deletePost(report.reportedPostId!)" *ngIf="report.reportedPostId">Delete Post</button>
                            <button class="btn btn-sm btn-secondary" (click)="dismiss(report.id)">Dismiss</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div *ngIf="reports.length === 0" class="alert alert-info">No pending reports.</div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  reports: ReportResponse[] = [];

  constructor(
      private adminService: AdminService,
      private postService: PostService,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
      if (isPlatformBrowser(this.platformId)) {
          this.loadReports();
      }
  }

  loadReports() {
      this.adminService.getAllReports().subscribe(reports => this.reports = reports);
  }

  banUser(report: ReportResponse) {
      if (!confirm(`Are you sure you want to BAN ${report.reportedUsername}?`)) return;
      if (report.reportedUserId) {
          this.adminService.banUser(report.reportedUserId).subscribe(() => {
              alert('User banned.');
          });
      }
  }

  deletePost(postId: number) {
      if (!confirm('Delete this post?')) return;
      this.postService.deletePost(postId).subscribe(() => {
          alert('Post deleted.');
          this.loadReports(); // Refresh? Or just remove from list if I implement that logic.
      });
  }

  dismiss(id: number) {
      this.adminService.dismissReport(id).subscribe(() => {
          this.reports = this.reports.filter(r => r.id !== id);
      });
  }
}
