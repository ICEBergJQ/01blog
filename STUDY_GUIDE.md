# 01Blog - Study Guide & Technical Explanation

This guide explains the architecture, key technologies, and important code flows of the **01Blog** project. Use this to prepare for code reviews, demos, or to understand how the fullstack application works.

---

## 1. High-Level Architecture
The project follows a **Fullstack** architecture separating the backend and frontend.

- **Backend (Server)**: Java Spring Boot. It provides a **REST API** to manage data. It connects to the database and handles security.
- **Frontend (Client)**: Angular (v19+). It runs in the browser, calls the backend APIs, and renders the user interface.
- **Database**: PostgreSQL. A relational database storing users, posts, comments, etc.
- **Communication**: JSON over HTTP. The frontend sends requests (GET, POST, etc.) to the backend, and the backend responds with JSON data.

---

## 2. Backend (Spring Boot)

### Key Layers
The backend code is organized into standard layers:
1.  **Controller (`/controller`)**: The "entry point". It defines REST endpoints (e.g., `@GetMapping("/api/posts")`). It receives HTTP requests and returns HTTP responses (`ResponseEntity`).
2.  **Service (`/service`)**: The "business logic". It contains the actual rules (e.g., "only admins can ban users"). It calls Repositories.
3.  **Repository (`/repository`)**: The "data access". It extends `JpaRepository` to talk to the database without writing raw SQL.
4.  **Model/Entity (`/model`)**: Classes mapped to database tables using `@Entity`.

### Authentication & Security (JWT)
The project uses **Stateless Authentication** with **JWT (JSON Web Tokens)**.
1.  **Login**: User sends username/password -> Backend validates -> Backend creates a signed JWT string -> Returns token to client.
2.  **Requests**: Frontend includes the token in the `Authorization: Bearer <token>` header for every request.
3.  **Validation**: `JwtAuthenticationFilter` intercepts every request, checks if the token is valid, and extracts the user. If valid, it tells Spring Security "this user is logged in".

**Key Files to Study:**
- `SecurityConfig.java`: Configures which routes are public (login, register) and which need login.
- `JwtService.java`: Generates and validates tokens.
- `JwtAuthenticationFilter.java`: The filter that runs before every request.

### Database Relationships (JPA)
- **One-to-Many**: One User has many Posts (`@OneToMany`).
- **Many-to-One**: A Comment belongs to one Post (`@ManyToOne`).
- **Many-to-Many**: Users following other Users.

---

## 3. Frontend (Angular)

### Key Concepts
1.  **Standalone Components**: The app doesn't use `NgModule`. Components import what they need directly (e.g., `imports: [CommonModule]`).
2.  **Services**: Used to fetch data. They are injected into components (Dependency Injection). e.g., `PostService` handles all HTTP calls for posts.
3.  **Observables (RxJS)**: Angular uses "streams" of data. When you call `.subscribe()`, you are waiting for the backend to respond.

### Authentication Flow
1.  **Login**: `AuthService.login()` sends creds to backend. On success, it saves the JWT in `localStorage`.
2.  **Interceptor**: `auth.interceptor.ts` automatically grabs the token from `localStorage` and adds it to the HTTP headers of *every* outgoing request.
3.  **Guard**: `auth.guard.ts` checks if a user is logged in before letting them visit protected routes (like `/profile`).

### Server-Side Rendering (SSR) & "Platform Browser"
This project uses Angular Universal (SSR).
- **The Issue**: On the server (Node.js), there is no `localStorage` or `window`. Accessing them causes crashes.
- **The Fix**: We use `isPlatformBrowser(this.platformId)` to check if the code is running in a browser before trying to access `localStorage` or fetch authenticated data.

---

## 4. Key Workflows to Explain

### A. "How does a user create a post with an image?"
1.  **Frontend**: User selects file -> `HomeComponent` calls `FileService.uploadFile()` -> Uploads file to backend via `FormData`.
2.  **Backend**: `FileUploadController` receives the multipart file -> Saves it to the local `uploads/` folder -> Returns the file URL.
3.  **Frontend**: Receives URL -> Sends a second request to `PostService.createPost()` containing the text content and the new image URL.
4.  **Backend**: `PostController` saves the post metadata (text + URL) to the database.

### B. "How does the Admin Dashboard work?"
1.  **Frontend**: `AdminDashboardComponent` calls `AdminService.getAllReports()`.
2.  **Backend**: `AdminController` checks if the requester has `ROLE_ADMIN`. If yes, returns list.
3.  **Action**: Admin clicks "Delete Post". Frontend calls `deletePost`. Backend checks if user is Admin OR Owner. Since they are Admin, it allows deletion.

### C. "How does 'Following' work?"
1.  **Model**: The `User` entity has a self-referencing Many-to-Many relationship (`following` list).
2.  **Logic**: When User A follows User B, we add User B to User A's `following` list and save.
3.  **Feed**: The `PostRepository` could be extended to `findPostsByUserIn(List<User> following)`, effectively creating a personalized feed. (Current implementation shows global feed for MVP simplicity).

---

---

## 6. Key Concepts to Know
*Below is a list of technical concepts used in this project that you should be prepared to discuss. If you need a deep dive into any of these, ask me to explain them.*

### **General Architecture & Design**
*   **RESTful API Design**: Principles of statelessness, resource-based URLs, and standard HTTP methods (GET, POST, PUT, DELETE).
*   **Dependency Injection (DI) & Inversion of Control (IoC)**: How Spring and Angular manage object lifecycles.
*   **Singleton Pattern**: The default scope of Spring Beans and Angular Services.
*   **DTO (Data Transfer Object)**: Why we use separate classes for API requests/responses instead of using Entity classes directly.
*   **CORS (Cross-Origin Resource Sharing)**: Why it exists and how it's configured.

### **Backend (Java / Spring Boot)**
*   **Spring Security & Filter Chain**: How requests are intercepted and authorized.
*   **JWT (JSON Web Token)**: Anatomy (Header, Payload, Signature) and why it's used for stateless auth.
*   **ORM (Object-Relational Mapping) & Hibernate**: Mapping Java objects to SQL tables.
*   **JPA (Java Persistence API)**: Using Interfaces to generate database queries.
*   **Transaction Management (`@Transactional`)**: Ensuring database atomicity during multi-step operations (like following a user).
*   **BCrypt Hashing**: Salting and hashing for secure password storage.

### **Frontend (Angular)**
*   **Component-Based Architecture**: Building a UI through modular, reusable blocks.
*   **Standalone Components**: Angular's modern way of building apps without NgModules.
*   **Directives (`*ngIf`, `*ngFor`)**: Conditional rendering and list handling.
*   **Reactive Programming (RxJS)**: Using Observables, Subjects, and operators like `tap` and `switchMap`.
*   **HTTP Interceptors**: Centralized handling of request headers (Auth).
*   **Route Guards**: Protecting pages from unauthorized access.
*   **SSR (Server-Side Rendering)**: How Angular pre-renders pages on the server and the concept of **Hydration**.
*   **Zone.js**: How Angular detects changes and updates the UI.

### **Database & Deployment**
*   **Relational Database Normalization**: Designing table schemas and relationships.
*   **Foreign Keys & Constraints**: Ensuring data integrity across tables.
*   **Docker & Containerization**: Using Docker Compose to spin up consistent environments.
*   **Stateless vs. Stateful Applications**: Understanding why the server doesn't "remember" the user between requests.
