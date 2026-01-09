import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div class="container">
        <a class="navbar-brand" routerLink="/">01Blog</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0" *ngIf="isBrowser && userId">
             <li class="nav-item">
                <form class="d-flex position-relative" (submit)="search()">
                    <input class="form-control form-control-sm me-2" type="search" placeholder="Search users..." aria-label="Search" [(ngModel)]="searchQuery" name="searchQuery" (input)="onSearchInput()" autocomplete="off">
                    
                    <div class="dropdown-menu show" *ngIf="searchResults.length > 0" style="position: absolute; top: 100%; left: 0; width: 100%;">
                        <button class="dropdown-item" *ngFor="let user of searchResults" (click)="goToUserProfile(user.id)">
                            {{ user.username }}
                        </button>
                    </div>
                </form>
             </li>
          </ul>

          <ul class="navbar-nav ms-auto">
            <ng-container *ngIf="isBrowser && (authService.currentUser$ | async); else guestLinks">
              <li class="nav-item">
                <a class="nav-link" routerLink="/">Home</a>
              </li>
              <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" (click)="loadNotifications()">
                    <i class="bi bi-bell"></i> 
                    <span class="badge bg-danger ms-1" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown" style="width: 300px; max-height: 400px; overflow-y: auto;">
                    <li *ngIf="notifications.length === 0" class="dropdown-item text-muted">No notifications</li>
                    <li *ngFor="let notif of notifications" class="dropdown-item border-bottom" [class.bg-light]="!notif.isRead">
                        <small>{{ notif.message }}</small><br>
                        <small class="text-muted" style="font-size: 0.75rem;">{{ notif.timestamp | date:'short' }}</small>
                        <button *ngIf="!notif.isRead" class="btn btn-sm btn-link p-0 ms-2" (click)="toggleRead($event, notif)">Mark Read</button>
                        <button *ngIf="notif.isRead" class="btn btn-sm btn-link p-0 ms-2" (click)="toggleRead($event, notif)">Mark Unread</button>
                    </li>
                  </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" (click)="goToProfile($event)">My Block</a>
              </li>
              <li class="nav-item" *ngIf="isAdmin">
                <a class="nav-link" routerLink="/admin">Admin</a>
              </li>
              <li class="nav-item">
                <button class="btn btn-link nav-link" (click)="logout()">Logout</button>
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
  userId: number | null = null;
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
                  this.userId = user.id;
                  this.isAdmin = user.role === 'ADMIN';
                  this.updateUnreadCount();
                },
                error: () => {
                   // If token is invalid (e.g. expired), logout or ignore
                   // this.authService.logout(); // Optional: auto logout
                }
            });
          } else {
            this.userId = null;
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

      action$.subscribe(() => {
          notif.isRead = !notif.isRead;
          this.updateUnreadCount();
      });
  }

  logout() {
    this.authService.logout();
  }

  goToProfile(event: Event) {
    event.preventDefault();
    if (this.userId) {
      this.router.navigate(['/profile', this.userId]);
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
