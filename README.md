Overview
Task Management System with JWT auth, role-based access, and task CRUD
Admin-created tasks are hidden from non-admin users

Tech Stack
Backend: .NET 8, EF Core, Npgsql (PostgreSQL), JWT
Frontend: React 18, Vite, TypeScript, Redux Toolkit, React Hook Form, Axios, Tailwind CSS

Project Structure
Backend: TaskManagement.Server
Frontend: taskmanagement.client

Backend Setup
Configure DB and JWT in TaskManagement.Server/appsettings.Development.json

PostgreSQL enums required:
task_status: TODO, IN_PROGRESS, DONE
task_priority: Low, Medium, High, Critical

Frontend Setup
API base URL (e.g., https://localhost:7242/api):
Create taskmanagement.client/.env.local:

Seed/Admin
On startup, creates admin if none exists:
Default: username admin, email admin@taskmanagement.com, password admin123

Promote a user (int role: USER=0, ADMIN=1):

API Endpoints
Auth:
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me (auth)
Tasks (auth):
GET /api/tasks?status=&assignee=
GET /api/tasks/{id}
POST /api/tasks
PUT /api/tasks/{id}
PUT /api/tasks/{id}/status
DELETE /api/tasks/{id}
Users (auth):
GET /api/users
Notes:
Non-admins cannot see tasks created by ADMINs

Frontend Features
Login/Register, protected routes, token storage and auto-logout
Board with columns (TODO, IN_PROGRESS, DONE)
Task modal (create/update), assignment dropdown, priority
Notifications for create/update/delete (bottom-left)
“New Task” button (navbar) and modal submit 

State Management
Redux Toolkit slices: auth, tasks, ui (notifications)
Loading/error states and optimistic UX where appropriate

Troubleshooting
401 Unauthorized: re-login to refresh token; ensure Issuer/Audience match
Enum errors (22P02/42804): ensure DB enums match C# names; app maps enums via Npgsql
Table/column not found: verify lowercase names and mappings in ApplicationDbContext

Notes
Role checks can be added via [Authorize(Roles = "ADMIN")] where needed
