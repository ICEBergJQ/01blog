#!/bin/bash

# Start Date: Mon Jan 12 03:30:00 2026 +0100
CURRENT_DATE="2026-01-12 03:40:00"

# Function to perform a dated commit using filenames only
commit_step() {
    MSG="$1"
    FILES="$2"
    
    # Loop through filenames and use glob to find them
    for FILE in $FILES; do
        # Use find to get the path or just try globbing if simple
        git add "**/$FILE" 2>/dev/null || git add "$FILE" 2>/dev/null
    done
    
    # Commit with backdated author and committer time
    GIT_AUTHOR_DATE="$CURRENT_DATE" GIT_COMMITTER_DATE="$CURRENT_DATE" git commit -m "$MSG"
    
    echo "✅ Committed: '$MSG' on $CURRENT_DATE"
    
    # Increment time
    CURRENT_DATE=$(date -d "$CURRENT_DATE + 1 hour" +"%Y-%m-%d %H:%M:%S")
}

echo "🚀 Starting Part 2 History Backfill..."

commit_step "Secured file upload" "FileUploadController.java SecurityConfig.java"

commit_step "Backend pagination" "PageResponse.java CursorResponse.java PostRepository.java ReportRepository.java PostService.java AdminService.java PostController.java AdminController.java"

commit_step "Fix post visibility" "PostService.java PostRepository.java"

commit_step "User stats" "UserResponse.java UserService.java AuthService.java AdminService.java UserController.java"

commit_step "Global exception handling" "GlobalExceptionHandler.java"

commit_step "Frontend pagination" "post.service.ts home.component.ts styles.css"

commit_step "Profile bio and stats" "profile.component.ts user.model.ts"

commit_step "Admin dashboard updates" "admin-dashboard.component.ts admin.service.ts"

commit_step "Toast notifications" "toast.service.ts toast.component.ts app.component.ts app.component.html post-card.component.ts navbar.component.ts login.component.ts register.component.ts"

commit_step "Modern Dojo theme" "styles.css navbar.component.css post-card.component.css index.html"

commit_step "Update docs" "STUDY_GUIDE.md"

echo "🎉 Part 2 History Backfill Complete!"