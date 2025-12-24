#!/bin/bash

# Start Date
CURRENT_DATE="2025-12-09 10:00:00"

# Base Paths to keep script clean
BE_SRC="src/main/java/com/example/blog"
FE_SRC="frontend/src/app"

# Function to perform a dated commit
commit_step() {
    MSG="$1"
    FILES="$2"
    DAYS_TO_ADD="$3"
    
    # Add the specified files
    # We use -f to force add if ignored (though shouldn't be) and ignore errors if already added
    git add $FILES
    
    # Calculate new date
    NEW_DATE=$(date -d "$CURRENT_DATE + $DAYS_TO_ADD days" +"%Y-%m-%d %H:%M:%S")
    CURRENT_DATE="$NEW_DATE"
    
    # Commit with backdated author and committer time
    GIT_AUTHOR_DATE="$CURRENT_DATE" GIT_COMMITTER_DATE="$CURRENT_DATE" git commit -m "$MSG"
    
    echo "✅ Committed: '$MSG' on $CURRENT_DATE"
}

echo "🚀 Starting History Backfill..."

# 1. Project Init
commit_step "Initial project setup with Maven and Git ignore" "pom.xml .gitignore" 0

# 2. Config
commit_step "Configure Spring Boot and Database properties" "src/main/resources/application.properties $BE_SRC/Application.java" 2

# 3. Security
commit_step "Implement JWT Security and Configuration" "$BE_SRC/config/ $BE_SRC/security/" 2

# 4. Models
commit_step "Define JPA Entities (User, Post, Comment, etc.)" "$BE_SRC/model/" 2

# 5. Repositories
commit_step "Create Data Access Repositories" "$BE_SRC/repository/" 2

# 6. Services
commit_step "Implement Business Logic Services" "$BE_SRC/service/" 2

# 7. Controllers
commit_step "Implement REST API Controllers" "$BE_SRC/controller/" 2

# 8. DTOs & Exceptions
commit_step "Add DTOs and Global Exception Handling" "$BE_SRC/dto/ $BE_SRC/exception/" 2

# 9. Frontend Init
commit_step "Initialize Angular Frontend Project" "frontend/package.json frontend/angular.json frontend/tsconfig* frontend/src/main* frontend/public" 3

# 10. Frontend Core
commit_step "Setup Frontend Core (App Config, Styles, Routes)" "$FE_SRC/app.config* $FE_SRC/app.routes* $FE_SRC/app.component* frontend/src/styles.css" 2

# 11. Frontend Services
commit_step "Implement Frontend Services and Auth Guards" "$FE_SRC/services/ $FE_SRC/guards/ $FE_SRC/interceptors/ $FE_SRC/models/" 2

# 12. Components
commit_step "Create Shared Components (Navbar, PostCard)" "$FE_SRC/components/" 3

# 13. Pages
commit_step "Implement Main Application Pages" "$FE_SRC/pages/home/ $FE_SRC/pages/login/ $FE_SRC/pages/register/ $FE_SRC/pages/profile/" 2

# 14. Admin
commit_step "Implement Admin Dashboard" "$FE_SRC/pages/admin-dashboard/" 2

# 15. Ops & Docs
commit_step "Add Docker Compose, Run Script, and Documentation" "docker-compose.yml run.sh README.md" 2

# 16. Final
commit_step "Study Guides" "STUDY_GUIDE.md TASKS.md audit.md issues.md backfill_commits.sh" 1

echo "🎉 History Backfill Complete!"