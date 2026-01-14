import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div class="text-center">
            <h1 class="display-1 fw-bold text-dark">{{ statusCode }}</h1>
            <p class="fs-3"> <span class="text-danger">Opps!</span> {{ statusText }}</p>
            <p class="lead">
                {{ message }}
            </p>
            <a routerLink="/" class="btn btn-primary">Go Home</a>
        </div>
    </div>
  `
})
export class ErrorComponent implements OnInit {
  statusCode = 404;
  statusText = 'Page not found';
  message = "The page you’re looking for doesn’t exist.";

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
      // Logic to determine error type from route data or params if needed.
      // For now, it defaults to 404 behavior but can be reused.
      this.route.data.subscribe(data => {
          if (data['status']) {
              this.statusCode = data['status'];
              this.statusText = data['text'] || 'Error';
              this.message = data['message'] || 'Something went wrong.';
          }
      });
  }
}
