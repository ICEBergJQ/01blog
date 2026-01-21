# 01Blog (Dojo) - Comprehensive Study Guide & Architecture

This guide explains the architecture, key technologies, and code flows of the **01Blog (Dojo)** project as it stands in its final version. Use this to prepare for code reviews, demos, or to understand the fullstack implementation details.

---

## 1. High-Level Architecture
The project follows a modern **Fullstack** architecture separating concerns between a robust backend and a reactive frontend.

-   **Backend**: Java 17 + Spring Boot 3.5. Exposes a **REST API**.
-   **Frontend**: Angular 19+ (Standalone). Consumes the API via HTTP.
-   **Database**: PostgreSQL 15 (Dockerized).
-   **Security**: Stateless JWT Authentication with Role-Based Access Control (RBAC).

---

## 2. Backend Deep Dive (Spring Boot)

### Core Layers
1.  **Controllers (`/controller`)**: Entry points. E.g., `PostController` handles `POST /api/posts`. Validates inputs using `@Valid`.
2.  **Services (`/service`)**: Business logic. E.g., `InteractionService` checks if a post is hidden before allowing a like.
3.  **Repositories (`/repository`)**: Interfaces extending `JpaRepository` for SQL operations. E.g., `PostRepository.countByUserIdAndHiddenFalse()`.
4.  **DTOs (`/dto`)**: Data Transfer Objects. We strictly use these (e.g., `RegisterRequest`) instead of Entities to control what data enters/leaves the API.

### Security Architecture (Critical)
*   **Chain**: `SecurityConfig` defines the filter chain.
*   **Filter**: `JwtAuthenticationFilter` runs before every request.
    *   It extracts the `Bearer` token.
    *   It validates the signature via `JwtService`.
    *   **Crucially**: It checks `userDetails.isEnabled()`. If a user is banned, this returns `false`, and the request is blocked *immediately*, even if the token is valid.
*   **Exception Handling**: `GlobalExceptionHandler` catches `DisabledException` (Ban), `BadCredentialsException` (Wrong password), and `DataIntegrityViolationException` (Duplicate Email/Username) to return clean JSON errors.

### Key Features Logic
*   **Pagination**:
    *   **Admin Dashboard**: Uses standard **Offset Pagination** (`Page 1, 2, 3`) via `PageRequest` and `PageResponse`.
    *   **Feed (Home/Profile)**: Uses **Cursor-Based Pagination** (`CursorResponse`) where the cursor is the `ID` of the last post. This prevents duplicates when new posts are added while scrolling.
*   **File Upload & Deletion**:
    *   `FileUploadController` receives `MultipartFile`.
    *   **Security**: Uploads are restricted to **authenticated users only**.
    *   **Secure Content Detection**: Instead of trusting file extensions, we use **Apache Tika** to inspect the file's "magic numbers" (bytes) to determine the true MIME type (e.g., preventing a `.exe` renamed to `.png`).
    *   **Validation**: 
        *   Strictly checks MIME types (supporting Images: JPG, PNG, GIF, WEBP, BMP, TIFF, HEIC, ICO; Videos: MP4, WEBM, MKV, AVI, MPEG, etc.).
        *   **Granular Size Limits**: 
            *   **Profile Pictures**: Max 10MB.
            *   **Post Images**: Max 20MB.
            *   **Post Videos**: Max 100MB.
    *   **Optimization**: Profile pictures are automatically detected and **resized to 400px width** on the server to improve performance and prevent "oversized image" warnings in the frontend.
    *   **File Deletion**: A new `FileService` is introduced to handle file deletions. When a post is deleted or a user changes their profile picture, the old file is safely removed from disk.

*   **Post Visibility**:
    *   Posts have a `hidden` boolean.
    *   Admins can see everything.
    *   Regular users (even owners) CANNOT see hidden posts in the feed (strict moderation).

---

## 3. Frontend Deep Dive (Angular)

### Architecture
*   **Standalone Components**: No `NgModule`. Imports like `CommonModule`, `FormsModule`, `RouterModule` are defined per component.
*   **Modern HTTP**: `app.config.ts` uses `provideHttpClient(withFetch())`. This enables the native Fetch API, which is critical for **SSR** performance and compatibility (Node.js environments).
*   **Interceptor**: `auth.interceptor.ts` is the gatekeeper.
    *   Adds `Authorization` header.
    *   **Error Handling**: If it sees a `401` (Expired) or `403` (Banned), it **wipes the token and forces a page reload**. This ensures a clean state reset.
*   **Services**:
    *   `ToastService`: Global notification system (Success/Error popups) replacing native alerts.
    *   `PostService`: Handles cursor pagination (`?cursor=123`).
*   **Error Handling**: When a user navigates to a non-existent profile, the `ProfileComponent` now catches the error and redirects to a proper "Not Found" page.

### UX/UI Patterns
*   **Styles**: We use a **"Modern Dojo"** aesthetic.
    *   Colors: Steel Blue (`#4A6D85`), Off-Black (`#0F0F0F`), Pure White.
    *   Grid: 3-Column Layout (Sidebar / Feed / Info).
*   **Responsive Design**:
    *   **Navigation**: The notification bell intelligently moves based on screen size (next to the toggler on Mobile for easy access, inside the menu next to the profile on Desktop for a cleaner layout).
    *   **Profile Header**: Adapts from a row layout (Desktop) to a stacked/centered column layout (Mobile).
*   **Validation Feedback**:
    *   **Client-Side Checks**: File sizes are checked in the browser before upload to prevent server rejections (CORS/Payload Too Large errors).
    *   **Character Limits**: Visual counters and strict limits on inputs (e.g., 100 chars for reports, 2000 for posts).
*   **Reporting System**: Replaced native browser prompts with a custom Bootstrap Modal for a better user experience.
*   **Optimistic UI**: When you follow a user, the button toggles *immediately* (and counter updates) while the API call happens in the background.
*   **Cache Busting**: Profile pictures use a query param (`?t=...`) to force the browser to reload the image when it changes.
*   **Deferred Upload**: Media files are not uploaded immediately upon selection. They are uploaded only when the user publishes the post, preventing orphaned files on the server.

---

## 4. Key Concepts to Study

### A. Annotations & Validation
*   `@Valid` / `@NotBlank` / `@Size`: How we enforce limits (e.g., max 2000 chars for posts, 500 for comments) before the data even hits the database.
*   `@Transactional`: Ensures that complex operations (like "Like Post" + "Send Notification") either both succeed or both fail.

### B. Pagination Strategies
*   **Offset**: `LIMIT 10 OFFSET 20`. Good for jumping to page 5. Bad for real-time feeds (duplicates).
*   **Cursor**: `WHERE id < 50 LIMIT 10`. Good for infinite scroll. No duplicates.

### C. Database Integrity
*   **Foreign Keys**: How `ON DELETE CASCADE` (managed by JPA `CascadeType.ALL`) ensures that if a User is deleted, their Posts and Comments vanish too.
*   **Unique Constraints**: How the database prevents two users from having the same email (`DataIntegrityViolationException`).

---

## 5. Under the Hood: How It Really Works

### A. The Request Lifecycle
When a user clicks "Login", here is the exact journey of that data:
1.  **Angular**: `LoginComponent` calls `AuthService.login()`.
2.  **HTTP Client**: Angular creates an HTTP POST request.
3.  **Interceptor**: `AuthInterceptor` sees the request. It checks `localStorage`. If a token exists, it appends `Authorization: Bearer xyz`.
4.  **Network**: The request travels to `http://localhost:8080/api/auth/authenticate`.
5.  **Spring Filter**: `JwtAuthenticationFilter` intercepts the incoming request.
    *   It parses the token.
    *   It checks the signature (is it fake?).
    *   It checks expiration.
    *   It queries the DB to see if the user is `enabled`.
    *   If all good, it sets `SecurityContext`.
6.  **Controller**: Spring routes the request to `AuthController.authenticate()`.
7.  **Service**: `AuthService` calls `AuthenticationManager`.
8.  **Provider**: `DaoAuthenticationProvider` hashes the incoming password (BCrypt) and compares it with the hash in the DB.
9.  **Response**: If match, a new JWT is generated and sent back as JSON.

### B. Dependency Injection (DI) "Wiring"
You see `@RequiredArgsConstructor` everywhere. This is **Lombok** generating a constructor.
*   **Spring**: When the app starts, it scans for `@Service`, `@Repository`, and `@Controller`.
*   **Wiring**: It sees `PostService` needs `PostRepository`. Spring creates the Repository instance first, then passes it into the Service's constructor. This "wiring" happens automatically (Inversion of Control).

### C. JPA & Hibernate Magic
When you call `postRepository.findVisiblePostsCursor(cursor, pageable)`, you didn't write SQL.
*   **Proxy**: Spring Data JPA creates a dynamic proxy class at runtime.
*   **Translation**: It parses the method name or `@Query` annotation.
*   **SQL Generation**: Hibernate translates JPQL (`SELECT p FROM Post...`) into native PostgreSQL SQL (`SELECT id, content... FROM posts WHERE hidden = false...`).
*   **Mapping**: The result rows are converted back into Java `Post` objects.

### D. JWT Signing
The token isn't encrypted (hidden); it's **signed**.
*   **Header**: "I am a JWT".
*   **Payload**: "User is 'admin', role is 'ADMIN', expires at 10:00".
*   **Signature**: `HMACSHA256(Header + Payload, SecretKey)`.
*   **Verification**: The server takes the header+payload from the user, hashes it again with its private `SecretKey`, and checks if the result matches the signature. If a hacker changed "USER" to "ADMIN" in the payload, the hash wouldn't match the signature, and the server rejects it.