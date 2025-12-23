# 01Blog - Social Learning Platform

## Overview
01Blog is a fullstack social blogging platform where users can share their learning journey, follow others, and interact via posts, likes, and comments.

## Technologies Used
- **Backend**: Java Spring Boot 3.5, Hibernate/JPA, PostgreSQL, Spring Security, JWT.
- **Frontend**: Angular 19+ (Standalone), Bootstrap 5, Bootstrap Icons.
- **Database**: PostgreSQL (Dockerized).

## Prerequisites
- Java 17 or higher
- Node.js 18+ and npm
- Docker and Docker Compose

## Setup & Run Instructions

### 1. Automated Start (Recommended)
We provide a script to start the database, backend, and frontend automatically.

```bash
chmod +x run.sh
./run.sh
```

- **Frontend**: [http://localhost:4200](http://localhost:4200)
- **Backend API**: [http://localhost:8080](http://localhost:8080)

### 2. Manual Start

#### Database
```bash
docker-compose up -d db
```

#### Backend
```bash
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Features Implemented

### Authentication & Users
- **JWT Auth**: Secure login and stateless session management.
- **Roles**: User and Admin roles.
- **Profile**: View user profiles and posts.

### Interactions
- **Posts**: Create (Text + Media Upload), Edit, Delete.
- **Engagement**: Like posts, Comment on posts.
- **Social**: Follow/Unfollow users.

### Moderation (Admin)
- **Reports**: Users can report posts or profiles.
- **Dashboard**: Admin can view reports, ban users, and delete content.

### File Upload
- Local file storage for images/videos.

## Project Structure
- `src/main/java`: Spring Boot Backend source code.
- `frontend`: Angular Frontend source code.
- `docker-compose.yml`: Database configuration.