# FindMyTutor

FindMyTutor is a tutor discovery and lesson-request platform built for the INFO 653 final project. Students search real tutor listings and request lessons; tutors manage their listings and respond to requests; administrators manage accounts, subjects, listings, and bookings.

The classroom application uses **JavaScript, React, React Router, Vite, Express, MySQL, mysql2, bcrypt, express-session, and Multer**. The active project is organized into `frontend/` and `backend/`.

The active project is written in JavaScript and JSX. It has no TypeScript source files.

## Features

- Student and tutor registration, login, logout, and role-protected workspaces.
- Bcrypt password hashes and HTTP-only session cookies.
- Tutor listing create, read, update, delete, search, and subject filtering.
- JPEG/PNG image uploads, content-signature checks, and a 2 MB limit.
- Student booking requests, student cancellation, and tutor accept/reject actions.
- Administrator dashboards, user approval/deactivation, subject management, listing management, and booking management.
- Server-side validation, prepared SQL statements, foreign-key constraints, and ownership checks.
- Responsive public and account pages.

## Project structure

```text
frontend/
  src/App.jsx                 React Router pages and role workspaces
  src/AuthContext.jsx         Browser session state
  src/api.js                  Credentialed API client
  src/styles.css              Responsive interface styles
backend/
  app.js                      Express middleware and static client hosting
  server.js                   API startup and MySQL connection check
  config/database.js          mysql2 connection pool
  middleware/                 Authentication, upload, and error handling
  routes/                     Auth, listing, subject, booking, and admin APIs
  database/schema.sql         Four application tables and constraints
  database/seed.sql           Development demo data
  database/seed.mjs           Applies schema and seed files
  uploads/                    Runtime image storage (ignored by git)
  test/                       Node test-runner validation and API guard tests
```

## Database relationships

- `users` stores students, tutors, and seeded administrators.
- `subjects` stores administrator-managed learning areas.
- `tutor_listings.tutor_id` references `users.user_id`; `subject_id` references `subjects.subject_id`.
- `bookings.student_id` references `users.user_id`; `tutor_listing_id` references `tutor_listings.tutor_listing_id`.
- The schema uses `RESTRICT` for referenced records. Accounts, subjects, tutor listings, and booking history cannot be deleted while dependent records exist; deactivate accounts or listings instead.
- These are the four application tables. Development sessions use Express's in-memory session store, so no fifth database table is created.

## Prerequisites

- Node.js 24.22.1+ (matches the project toolchain).
- MySQL 8.0+ running locally.
- npm.

The project was authored against MySQL 8.0 syntax. Use a supported MySQL 8.0 or 8.4 server for the classroom database.

## Installation and database setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file and change the session secret and MySQL settings:

   ```bash
   cp .env.example .env
   ```

   Keep `.env` private. Do not commit it or paste secret values into chat.

3. Create the database and sample records. The seed script applies `schema.sql` first, then `seed.sql`:

   ```bash
   npm run seed
   ```

   Or run the SQL files manually, in order:

   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p < backend/database/seed.sql
   ```

   `DB_USER`, `DB_PASSWORD`, and `DB_PORT` in `.env` must match your local MySQL setup. If your MySQL user cannot create databases, create `findmytutor` first with an account that can, then run the schema file.

## Start the application

With MySQL running and `.env` configured:

```bash
npm run dev
```

This starts React/Vite at <http://localhost:5173>, the Express API at <http://localhost:4000>, and a health check at <http://localhost:4000/api/health>. Vite proxies `/api` and `/uploads` to Express.

For a production-style local run:

```bash
npm run build
npm start
```

Express serves the built client and API on port 4000. Set `VITE_PORT` and `PORT` in `.env` to change ports.


## Demo accounts

The seed data uses fictional accounts. All demo accounts share this **development-only** password:

```text
DemoPass123!
```

| Role | Email |
| --- | --- |
| Administrator | `admin@demo.test` |
| Student | `student@demo.test` |
| Student | `jordan.student@demo.test` |
| Tutor | `maya.chen@demo.test` |
| Tutor | `daniel.sok@demo.test` |
| Tutor | `sophea.lim@demo.test` |
| Tutor | `noah.williams@demo.test` |
| Tutor | `lina.park@demo.test` |
| Tutor | `omar.haddad@demo.test` |
| Tutor | `priya.nair@demo.test` |
| Tutor | `ethan.brown@demo.test` |
| Tutor | `nita.vann@demo.test` |
| Tutor | `lucas.martin@demo.test` |
| Tutor | `chenda.khem@demo.test` |

Every seeded tutor has a sample listing. Registration creates students as active and tutors as pending administrator approval. Public registration cannot create administrators.

## Testing

Run the project checks:

```bash
npm test
npm run build
```

`testing-report.md` records the checks actually run and lists workflows requiring a running MySQL service. MySQL must be available before `npm run dev` starts.

## Security and classroom limitations

- All SQL uses mysql2 prepared statements. Role checks and record ownership are enforced in Express routes.
- Passwords are bcrypt-hashed. User responses never include `password_hash`.
- Session cookies are HTTP-only, `SameSite=Lax`, and `Secure` in production. Set a long random `SESSION_SECRET` in `.env`.
- Multer limits uploads to one JPEG or PNG file at 2 MB; the server checks file signatures and creates UUID filenames.
- Express's default session store is in memory, suitable for a single-process classroom demo. Sessions are cleared when the server restarts; a durable multi-instance deployment needs a separate session store.
- Booking collision checks reserve the same listing/date/time for pending or accepted requests. This project does not implement a tutor availability calendar or payment processing.
- Images are stored on the local filesystem. A deployment that does not preserve local files needs an external file store.
- Demo credentials and sample records must be replaced before any public deployment.

# FindMyTurtor
