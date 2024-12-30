# Software Requirements Specification (School Demo Project)
## Authentication and Authorization System

### 1. Introduction
#### 1.1 Purpose
This document outlines the software requirements for developing a role-based authentication and authorization system using Next.js 15, NextAuth, Prisma, PostgreSQL, and shadcn UI.
More Info [Notion Docs](https://www.notion.so/nahid-me/demo-school-notes-16bca934b374801f964bc9021ebc6a27)

#### 1.2 Project Scope
The system will implement a hierarchical role-based access control system with four user types: SuperAdmin, Institution, Teacher, and Student. The primary focus is on implementing secure authentication and granular authorization mechanisms.

### 2. System Overview
#### 2.1 System Architecture
- Next.js 15 for the frontend and API routes
- NextAuth for authentication
- Prisma as the ORM
- PostgreSQL for the database
- shadcn UI for the component library

#### 2.2 User Roles and Hierarchy
1. SuperAdmin
   - Highest level of access
   - Manages institutions and global settings
2. Institution
   - Manages their own teachers and students
   - Controls institution-specific settings
3. Teacher
   - Manages preset-specific content
   - Interacts with assigned students
4. Student
   - Limited access to view assigned content

### 3. Functional Requirements

#### 3.1 Authentication
1. User Registration
   - Secure registration process for all user types
   - Email verification system
   - Password strength requirements
   - Prevention of duplicate accounts

2. User Login
   - Email and password authentication
   - Session management
   - Remember me functionality
   - Password reset mechanism
   - Multi-factor authentication (optional)

3. Session Management
   - Secure session handling
   - Auto logout after inactivity
   - Concurrent session handling

#### 3.2 Authorization & Access Control

1. SuperAdmin Capabilities
   - Create, read, update, delete institutions
   - Manage institution presets
   - View and manage all users
   - Access system-wide analytics
   - Configure global settings

2. Institution Capabilities
   - Create, read, update, delete own teachers
   - Create, read, update, delete own students
   - Assign teachers to presets
   - Create and manage global notices
   - View institution-specific analytics

3. Teacher Capabilities
   - View assigned presets
   - Create notices for assigned presets
   - View and interact with assigned students
   - Access teaching resources

4. Student Capabilities
   - View assigned notices
   - Access learning materials
   - View own profile and progress

#### 3.3 Notice Management

1. Global Notices
   - Creation by Institution users
   - Viewable by all users within the institution

2. Preset-specific Notices
   - Creation by Teachers
   - Viewable by assigned students
   - Categorization and filtering options

### 4. Non-Functional Requirements

#### 4.1 Security
1. Authentication Security
   - Password hashing using bcrypt
   - JWT token management
   - CSRF protection
   - Rate limiting for login attempts

2. Data Security
   - Encryption for sensitive data
   - Secure API endpoints
   - Input validation and sanitization
   - XSS protection

#### 4.2 Performance
- Page load time < 2 seconds
- API response time < 500ms
- Support for concurrent users
- Efficient database queries

#### 4.3 Scalability
- Horizontal scaling capability
- Database optimization
- Caching implementation
- Resource optimization

#### 4.4 Usability
- Responsive design
- Intuitive navigation
- Consistent UI/UX
- Accessibility compliance

### 5. Database Schema

#### 5.1 Core Tables
1. Users
   - id (UUID)
   - email
   - password_hash
   - role (enum)
   - created_at
   - updated_at

2. Institutions
   - id (UUID)
   - name
   - status
   - settings (JSON)

3. Presets
   - id (UUID)
   - institution_id
   - name
   - settings (JSON)

4. Notices
   - id (UUID)
   - creator_id
   - preset_id (optional)
   - title
   - content
   - type (global/preset)
   - created_at

#### 5.2 Relationship Tables
1. TeacherPresets
   - teacher_id
   - preset_id
   - assigned_at

2. StudentPresets
   - student_id
   - preset_id
   - assigned_at

### 6. API Endpoints

#### 6.1 Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/reset-password
- GET /api/auth/session

#### 6.2 User Management
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

#### 6.3 Institution Management
- GET /api/institutions
- POST /api/institutions
- PUT /api/institutions/:id
- DELETE /api/institutions/:id

#### 6.4 Notice Management
- GET /api/notices
- POST /api/notices
- PUT /api/notices/:id
- DELETE /api/notices/:id

### 7. Technical Stack
- Frontend: Next.js 15
- Authentication: NextAuth.js
- Database: PostgreSQL
- ORM: Prisma
- UI Components: shadcn UI
- API: REST
- State Management: React Context/Zustand
- Form Handling: react-hook-form
- Validation: Zod