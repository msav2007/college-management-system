# Usage & License Notice

This project is created by **M Sri Anshu Venkat**.

Allowed:

- Learning and reference
- Understanding implementation

Not Allowed:

- Copying and submitting as your own project
- Renaming and re-uploading
- Commercial use or resale

Mandatory Credit:
If you use this project, you MUST give proper credit:

Original Author: M Sri Anshu Venkat
GitHub: https://github.com/msav2007/college-management-system

Unauthorized use or plagiarism is strictly prohibited and may lead to copyright action.

# College Management System (Role-Based)

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?style=flat-square&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-2563eb?style=flat-square)
![RBAC](https://img.shields.io/badge/Security-RBAC-0f172a?style=flat-square)
![License](https://img.shields.io/badge/License-Academic%20Use%20Only-dc2626?style=flat-square)

A role-based college management system and student management system built with Node.js, Express, JWT authentication, SQL.js, and a clean admin, faculty, and student dashboard. This project is designed as a production-style college ERP dashboard for academic operations, attendance, assignments, notices, exams, results, fees, materials, timetable management, and outing workflows.

## Features

### Admin

- Manage students and faculty records
- Manage departments, branches, subjects, and faculty assignment
- Create timetable slots and exam schedules
- Update fee records and salary status
- Post, edit, and delete notices
- View and manage attendance, assignments, materials, results, and outing requests
- Delete students with related data cleanup

### Faculty

- View assigned students and subjects
- Mark subject-wise attendance
- Create assignments and upload academic materials
- Publish subject-wise marks/results
- View timetable and student submissions
- Create notices for students mapped to faculty subjects
- Review outing requests for assigned students

### Student

- Sign in to a role-based dashboard
- View subject-wise attendance, timetable, results, and fee status
- View notices available to their academic mapping
- View assignments and upload submissions
- Access downloadable study materials
- Apply for outing requests and track approval status

## Tech Stack

- **Backend:** Node.js, Express.js
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Database:** SQL.js with schema bootstrapped from `database/cms.sql` and persisted to `database/cms.db`
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Security / Middleware:** helmet, cors, custom auth middleware, role middleware
- **File Uploads:** multer
- **Development:** nodemon

## Key Highlights

- JWT-based authentication with role-aware redirects
- Role-based access control for Admin, Faculty, and Student users
- Modular Express backend with dedicated route files
- SQL schema plus runtime migrations for academic structure
- Clean dark-light dashboard UI with shared frontend architecture
- Subject-based attendance, assignments, materials, notices, exams, and results
- Demo forgot-password and reset-password workflow
- File upload support for assignments, materials, and submissions

## Project Structure

```text
college-management-system/
|-- backend/
|   |-- config/
|   |   `-- db.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |   `-- roleMiddleware.js
|   |-- routes/
|   |   |-- academicRoutes.js
|   |   |-- assignmentRoutes.js
|   |   |-- attendanceRoutes.js
|   |   |-- authRoutes.js
|   |   |-- facultyRoutes.js
|   |   |-- materialRoutes.js
|   |   |-- noticeRoutes.js
|   |   |-- outingRoutes.js
|   |   |-- resultRoutes.js
|   |   |-- studentRoutes.js
|   |   `-- submissionRoutes.js
|   |-- uploads/
|   `-- server.js
|-- database/
|   |-- cms.db
|   `-- cms.sql
|-- frontend/
|   |-- academics.html
|   |-- assignments.html
|   |-- attendance.html
|   |-- dashboard.html
|   |-- exams.html
|   |-- faculty.html
|   |-- fees.html
|   |-- forgot-password.html
|   |-- login.html
|   |-- materials.html
|   |-- notices.html
|   |-- outing.html
|   |-- reset-password.html
|   |-- students.html
|   |-- timetable.html
|   |-- css/
|   |   `-- styles.css
|   `-- js/
|       `-- app.js
|-- package.json
`-- README.md
```

## Installation

### Prerequisites

- Node.js 18+ recommended
- npm

### Setup

```bash
npm install
```

### Start the Application

```bash
npm start
```

Or run the server directly:

```bash
node backend/server.js
```

Open the application in your browser:

```text
http://localhost:3000
```

## Usage

### Demo Accounts

- **Admin:** `admin@college.edu` / `Admin@123`
- **Faculty:** `faculty@college.edu` / `Faculty@123`
- **Student:** `student@college.edu` / `Student@123`

### Authentication Flow

- The app starts at `login.html`
- Login returns a JWT token and role information
- The frontend stores session state in `localStorage`
- Protected pages validate the token through `/api/me`

### Database Behavior

- The system bootstraps schema from `database/cms.sql`
- Runtime data is persisted in `database/cms.db`
- Demo academic, attendance, results, notices, fees, materials, submissions, and outing data are seeded automatically

### Optional Environment Variables

- `PORT`
- `JWT_SECRET`

## Academic and Workflow Coverage

- Department -> Branch -> Subject academic hierarchy
- Faculty-to-subject assignment
- Subject-based attendance tracking
- Subject-scoped assignments and materials
- Faculty-targeted notices for mapped students
- Exam scheduling and result publishing
- Fee tracking and timetable management
- Assignment submissions with uploaded files
- Outing request approval workflow

## Future Improvements

- Add automated test coverage for API and UI workflows
- Add audit logs and activity history
- Add pagination, filtering, and export support for large datasets
- Add email delivery for password reset and notices
- Add Docker support and environment-based deployment setup
- Add finer-grained validation and rate limiting

## SEO and Repository Optimization

### Suggested Repository Name

`college-management-system-role-based`

### Suggested GitHub Description

Role-based college management system built with Node.js, Express, JWT authentication, SQL.js, and a clean admin, faculty, and student dashboard.

### Suggested Topics

`college-management-system`, `student-management-system`, `nodejs`, `express`, `jwt-authentication`, `role-based-access-control`, `sqljs`, `sqlite`, `vanilla-javascript`, `admin-dashboard`, `faculty-dashboard`, `student-dashboard`, `attendance-management`, `assignment-management`, `education-software`

### Ranking Suggestions

- Keep the README updated with feature screenshots and release notes
- Use clear commit history and regular updates
- Add deployment instructions and a live demo when available
- Publish feature-focused issues and roadmap items
- Use topic tags consistently and keep the repository active

## License

This project is distributed under the Personal Academic Use Only License. See the `LICENSE` file for usage restrictions and credit requirements.
