# 01Blog Implementation Checklist

## Phase 1: Backend Infrastructure (Spring Boot)
- [x] **Database Setup**: Configure PostgreSQL connection in `application.properties`.
- [x] **Project Structure**: Create packages (`model`, `repository`, `service`, `controller`, `security`, `dto`).
- [x] **Security Setup**: Add JWT dependency, create `JwtUtils`, and configure `SecurityConfig` for stateless authentication.

## Phase 2: Backend Core Features
- [x] **User Module**:
    - [x] Create `User` entity (username, email, password, role).
    - [x] Create `UserRepository`.
    - [x] Implement `AuthService` (register, login with JWT).
    - [x] Create `AuthController`.
- [x] **Post Module**:
    - [x] Create `Post` entity (content, mediaUrl, timestamp, User relationship).
    - [x] Create `PostRepository` & `PostService`.
    - [x] Create `PostController` (CRUD).
- [x] **Interaction Module**:
    - [x] Implement `Comment` entity & APIs.
    - [x] Implement `Like` logic.
    - [x] Implement `Subscription` (Follow) logic.
- [x] **Admin & Reports**:
    - [x] Create `Report` entity.
    - [x] Implement Admin APIs (ban user, delete post, view reports).

## Phase 3: Frontend Initialization (Angular)
- [x] Initialize Angular project (`frontend` directory).
- [x] Install Angular Material or Bootstrap.
- [x] Configure HTTP Client and Proxy/CORS.

## Phase 4: Frontend Features
- [x] **Auth**: Login and Register pages.
- [x] **Home/Feed**: Display posts from subscriptions (and global for MVP).
- [x] **Profile**: User's "block" with their posts.
- [x] **Post Creation**: Form to upload text/media.
- [x] **Admin Dashboard**: View for managing reports and users.
- [x] **Notifications**: Navbar icon and backend integration.