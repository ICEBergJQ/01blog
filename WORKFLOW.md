# Application Workflow Documentation

This document outlines the end-to-end workflow of the **01Blog (Dojo)** application, detailing how the Frontend (Angular) and Backend (Spring Boot) interact to deliver key features.

---

## 1. Authentication Flow (The Gatekeeper)

Before any feature can be accessed, the user must authenticate.

### Login / Register
1.  **User Action**: User enters credentials in `LoginComponent` or `RegisterComponent`.
2.  **Frontend**: `AuthService` sends a `POST` request to `/api/auth/authenticate` or `/api/auth/register`.
3.  **Backend**:
    *   **Validation**: Checks `@Valid` constraints (Email format, Password length/complexity).
    *   **Security**: `DaoAuthenticationProvider` verifies the password (BCrypt hash).
    *   **Token Generation**: If valid, `JwtService` creates a signed **JWT (JSON Web Token)** containing the username and role.
4.  **Handshake**: The server responds with the JWT.
5.  **Storage**: The Frontend saves this token in `localStorage`.

### Authenticated Requests
1.  **Interceptor**: Every subsequent HTTP request is intercepted by `auth.interceptor.ts`.
2.  **Injection**: The interceptor adds the header: `Authorization: Bearer <token>`.
3.  **Backend Filter**: `JwtAuthenticationFilter` intercepts the request before it reaches any Controller.
    *   It validates the token signature.
    *   It checks if the user is still `enabled` (not banned).
    *   If valid, the request proceeds to the Controller. If not, a `403 Forbidden` is returned.

---

## 2. Feed & Content Flow (Home Page)

The core experience is the infinite-scroll feed.

### Loading Posts (Cursor Pagination)
1.  **Frontend**: `HomeComponent` initializes and calls `PostService.getAllPosts()`.
2.  **Request**: `GET /api/posts?cursor=123&limit=10`.
    *   `cursor`: The ID of the last post loaded (null for the first page).
    *   `limit`: How many posts to fetch.
3.  **Backend**: `PostController` calls `PostService`, which queries `PostRepository`.
4.  **Database**:
    *   Query: `SELECT * FROM posts WHERE id < :cursor AND hidden = false ORDER BY id DESC LIMIT :limit`.
    *   *Why ID < Cursor?* This is faster and safer than `OFFSET` pagination for real-time feeds, preventing duplicates when new posts are created.
5.  **Response**: Returns a list of posts + `nextCursor` (the ID of the last post in the list).
6.  **Frontend**: Appends new posts to the `posts` array and updates the UI.

### Creating a Post (With Media)
1.  **Validation (Client)**: User selects a file. Frontend checks:
    *   Is it an Image? -> Max 20MB.
    *   Is it a Video? -> Max 100MB.
    *   If too big, it warns immediately (no server request).
2.  **Upload (Optional)**: If a file is selected, `FileService` uploads it *first* to `/api/files/upload`.
    *   **Backend Security**: `FileUploadController` uses **Apache Tika** to inspect file bytes (Magic Numbers) to ensure it's a real image/video, not a spoofed `.exe`.
    *   **Response**: Server returns the `fileUrl`.
3.  **Submission**: Frontend calls `PostService.createPost()` with text content and the `fileUrl`.
4.  **Persistence**: Backend saves the `Post` entity with the `mediaUrl`.

---

## 3. Profile & User Management

### Profile Page
1.  **Route**: `/profile/:id`.
2.  **Guard**: `ProfileComponent` checks if `:id` is a valid number. If not, redirects to 404.
3.  **Data Fetch**: Calls `UserService.getUser(id)` and `PostService.getUserPosts(id)`.
4.  **Layout**: The UI adapts:
    *   **Desktop**: Row layout (Picture left, Info right).
    *   **Mobile**: Column layout (Picture centered, Info below).

### Profile Picture Update (Secure Flow)
1.  **Selection**: User picks a new avatar. Client checks size (<10MB).
2.  **Upload**: `POST /api/files/upload-profile-picture`.
    *   **Backend**: Checks file bytes (Tika). Only valid images allowed.
    *   **Resizing**: Server automatically resizes the image to **400px width** (keeping aspect ratio) to save bandwidth and improve load times.
3.  **Update**: Frontend sends the new URL to `UserService.updateProfilePicture()`.
4.  **Cleanup**: Backend **deletes** the old profile picture file from the disk to save space (unless it was the default avatar).

---

## 4. Interaction & Moderation

### Real-time-like Interactions
*   **Optimistic UI**: When a user clicks "Like" or "Follow":
    1.  The button changes color *immediately*.
    2.  The counter increments *immediately*.
    3.  The API request is sent in the background.
    4.  If the API fails, the change is reverted and an error toast appears.

### Reporting System
1.  **UI**: User clicks "Report". A custom Bootstrap Modal appears.
2.  **Constraint**: Textarea limits input to **100 characters**.
3.  **Backend**: `ReportRequest` DTO enforces the 100-char limit again.
4.  **Storage**: Report is saved to the `reports` table. (Admins would view these in a Dashboard).

---

## 5. File System Architecture

*   **Storage**: Files are stored locally in the `uploads/` directory on the server (or container).
*   **Serving**: Files are served via `GET /api/files/download/{filename}`.
*   **Type Safety**: The system supports standard Web formats (JPG, PNG, MP4, WEBM) and strictly rejects executables or scripts (HTML/SVG) to prevent XSS attacks.

---

## 6. Architecture Summary

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Frontend View** | Angular Templates (HTML) | Responsive Layouts (Mobile/Desktop), Modals |
| **Frontend Logic** | Angular Components (TS) | Client-side Validation, Optimistic UI, HTTP Calls |
| **API Interface** | Spring Controllers | REST Endpoints, Input Validation (`@Valid`) |
| **Security Layer** | Spring Security Filters | JWT Parsing, Role Checks, Ban Enforcement |
| **Business Logic** | Spring Services | File Deletion logic, Transaction management |
| **Data Access** | Spring Data JPA | SQL Generation, Cursor Pagination |
| **Database** | PostgreSQL | Persistent storage of Users, Posts, Relations |
