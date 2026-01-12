import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top" style="background-color: #4a4a4a !important; border-bottom: 1px solid #666; z-index: 1030;">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <img src="assets/logo.png" alt="Dojo Logo" height="40">
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-start align-items-lg-center">
            <ng-container *ngIf="isBrowser && (authService.currentUser$ | async); else guestLinks">
              <li class="nav-item me-lg-3 me-0 mb-2 mb-lg-0" *ngIf="currentUser">
                 <form class="d-flex position-relative align-items-center" (submit)="search()">
                    <div class="input-group input-group-sm">
                        <span class="input-group-text bg-white border-end-0 rounded-start-pill text-muted border-secondary">
                            <i class="bi bi-search"></i>
                        </span>
                        <input class="form-control border-start-0 rounded-end-pill bg-white shadow-none border-secondary" type="search" placeholder="Search..." aria-label="Search" [(ngModel)]="searchQuery" name="searchQuery" (input)="onSearchInput()" autocomplete="off" style="width: 200px;">
                    </div>
                    <div class="dropdown-menu show shadow-sm border-0 mt-1" *ngIf="searchResults.length > 0" style="position: absolute; top: 100%; right: 0; min-width: 250px; z-index: 1050;">
                        <button class="dropdown-item d-flex align-items-center" *ngFor="let user of searchResults" (click)="goToUserProfile(user.id)">
                            <img [src]="user.profilePictureUrl ? 'http://localhost:8080' + user.profilePictureUrl : 'assets/default-avatar.png'" class="rounded-circle me-2" style="width: 24px; height: 24px; object-fit: cover;">
                            <span>{{ user.username }}</span>
                        </button>
                    </div>
                </form>
              </li>

              <li class="nav-item">
                <a class="nav-link d-flex align-items-center" routerLink="/">
                  <i class="bi bi-house-door-fill me-1"></i> Home
                </a>
              </li>
              <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle position-relative" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" (click)="loadNotifications()">
                    <i class="bi bi-bell-fill"></i> 
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;" *ngIf="unreadCount > 0">
                        {{ unreadCount }}
                    </span>
                  </a>
                  <div class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="navbarDropdown">
                    <div class="notification-header">Notifications</div>
                    <div *ngIf="notifications.length === 0" class="p-3 text-center text-muted">No notifications</div>
                    <div *ngFor="let notif of notifications" class="notification-item" [class.unread]="!notif.isRead">
                        <span class="mb-1">{{ notif.message }}</span>
                        <div class="notif-meta">
                            <span class="notif-time">{{ notif.timestamp | date:'short' }}</span>
                            <button *ngIf="!notif.isRead" class="btn btn-link btn-mark" (click)="toggleRead($event, notif)">Mark Read</button>
                            <button *ngIf="notif.isRead" class="btn btn-link btn-mark text-muted" (click)="toggleRead($event, notif)">Mark Unread</button>
                        </div>
                    </div>
                  </div>
              </li>
              <li class="nav-item">
                <a class="nav-link d-flex align-items-center" href="#" (click)="goToProfile($event)">
                    <img [src]="currentUser?.profilePictureUrl ? 'http://localhost:8080' + currentUser?.profilePictureUrl : 'assets/default-avatar.png'" 
                         class="rounded-circle me-2" 
                         style="width: 25px; height: 25px; object-fit: cover; border: 1px solid #fff;">
                    My Profile
                </a>
              </li>
              <li class="nav-item" *ngIf="isAdmin">
                <a class="nav-link d-flex align-items-center" routerLink="/admin">
                  <i class="bi bi-shield-lock-fill me-1"></i> Admin
                </a>
              </li>
              <li class="nav-item">
                <button class="btn btn-outline-light btn-sm ms-2 d-flex align-items-center" (click)="logout()">
                  <i class="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </li>
            </ng-container>
            <ng-template #guestLinks>
              <li class="nav-item">
                <a class="nav-link" routerLink="/login">Login</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/register">Register</a>
              </li>
            </ng-template>
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  unreadCount = 0;
  notifications: Notification[] = [];
  isBrowser = false;
  
  searchQuery = '';
  searchResults: User[] = [];

  constructor(
      public authService: AuthService, 
      private router: Router,
      private notificationService: NotificationService,
      private userService: UserService,
      private toastService: ToastService,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {
      this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
        this.authService.currentUser$.subscribe(token => {
          if (token) {
            this.authService.getMe().subscribe({
                next: (user) => {
                  this.currentUser = user;
                  this.isAdmin = user.role === 'ADMIN';
                  this.updateUnreadCount();
                },
                error: () => {
                   // If token is invalid (e.g. expired), logout or ignore
                   // this.authService.logout(); // Optional: auto logout
                }
            });
          } else {
            this.currentUser = null;
            this.isAdmin = false;
          }
        });
    }
  }

  updateUnreadCount() {
      this.notificationService.getUnreadCount().subscribe(count => this.unreadCount = count);
  }

  loadNotifications() {
      this.notificationService.getNotifications().subscribe(notifs => this.notifications = notifs);
  }

  toggleRead(event: Event, notif: Notification) {
      event.stopPropagation();
      event.preventDefault();
      
      const action$ = notif.isRead 
        ? this.notificationService.markAsUnread(notif.id) 
        : this.notificationService.markAsRead(notif.id);

      action$.subscribe({
          next: () => {
              notif.isRead = !notif.isRead;
              this.updateUnreadCount();
              this.toastService.show(notif.isRead ? 'Marked as read' : 'Marked as unread', 'info');
          },
          error: () => this.toastService.show('Failed to update notification', 'error')
      });
  }

  logout() {
    this.authService.logout();
    this.toastService.show('Logged out successfully', 'info');
  }

  goToProfile(event: Event) {
    event.preventDefault();
    if (this.currentUser) {
      this.router.navigate(['/profile', this.currentUser.id]);
    }
  }

  onSearchInput() {
      if (this.searchQuery.length < 2) {
          this.searchResults = [];
          return;
      }
      this.userService.searchUsers(this.searchQuery).subscribe(users => {
          this.searchResults = users;
      });
  }

  search() {
      // Optional: Navigate to a dedicated search page
  }

  goToUserProfile(userId: number) {
      this.searchResults = [];
      this.searchQuery = '';
      this.router.navigate(['/profile', userId]);
  }
}