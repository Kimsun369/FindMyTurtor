# FindMyTutor

FindMyTutor is a local tutor-discovery website for the INFO 653 final project. Visitors browse tutor listings; students can request lessons; tutors manage their own listings and respond to requests; administrators manage accounts, subjects, listings, and bookings.

The INFO 653 brief allows a similar topic with instructor approval. FindMyTutor is not one of the listed sample topics, so confirm your instructor approved it for your team.

## Roles and demo accounts

Every seeded account uses the development-only password `DemoPass123!`.

| Role | Demo email | What to show |
| --- | --- | --- |
| Student | `student@demo.test` | Browse tutors, request lessons, view or cancel requests |
| Tutor | `maya.chen@demo.test` | Create/edit/delete own listings and respond to requests |
| Administrator | `admin@demo.test` | Review counts, approve accounts, manage subjects/listings |

The seed also includes a second student and nine more tutors. Their emails are listed in `backend/database/seed.sql`. These accounts and the password are fictional and for local demonstrations only.

## Install and run

Prerequisites: Node.js 24.22.1+, npm, and MySQL 8.0 or 8.4.

```bash
npm install
cp .env.example .env
```

Edit `.env` with your local MySQL username/password and a private `SESSION_SECRET`. Start MySQL, then create the database and demo records:

```bash
npm run seed
```

Start the frontend and API together:

```bash
npm run dev
```

- Website: <http://localhost:5173>
- Express API health check: <http://localhost:4000/api/health>
- Port 4000 is the API during development; its `/` redirects to Vite.

For a production-style local run, build first, then set production mode for the server:

```bash
npm run build
NODE_ENV=production npm start
```

Open <http://localhost:4000>. MySQL must be running for the API and the database-backed pages to work.

## Demo script

### Visitor

1. Open `/`. The login card and staircase are visible immediately.
2. Browse tutors from the header, search or filter, and open a tutor detail page.
3. Register as a student or return to the home page to sign in.

### Student

1. Sign in with `student@demo.test` / `DemoPass123!`.
2. Review the student workspace and seeded requests.
3. Browse a tutor, submit a future lesson request, then inspect it in **My bookings**. A pending request can be cancelled.

### Tutor

1. Sign out and sign in with `maya.chen@demo.test` / `DemoPass123!`.
2. Create or edit a listing; optionally upload one JPEG/PNG under 2 MB.
3. Open **Requests** and accept or reject a pending request.
4. To demonstrate ownership enforcement, sign in as `daniel.sok@demo.test` and attempt a direct update of Maya's listing; the API returns 403.

### Administrator

1. Sign in with `admin@demo.test` / `DemoPass123!`.
2. Show dashboard counts, search/approve/deactivate accounts, manage subjects, and review listings/bookings.

## Postman API demonstration

The API base URL is `http://localhost:4000/api`. Postman requests use the Express port, not the Vite port.

1. Start MySQL, run `npm run seed`, and start `npm run dev`.
2. In Postman, import [`postman/FindMyTutor.postman_collection.json`](postman/FindMyTutor.postman_collection.json).
3. Send requests in order within each folder: public requests, student, tutor, and administrator. Review each request's **Test Results**.
4. Use the same `localhost:4000` host for all requests. Postman stores the `findmytutor.sid` session cookie after login; this API does not use bearer tokens. Logging in as another role replaces the active session.

The collection demonstrates health, search, unauthenticated access rejection, student booking, tutor listing validation and CRUD, cross-owner denial, and admin access. Booking requests remain in the database. The tutor folder creates and deletes its own temporary listing. For image upload, send `POST /api/listings` as a tutor with **Body → form-data**, the listing fields as text, and `image` as a File. Choose a JPEG/PNG below 2 MB; let Postman set the multipart content type and boundary.

Postman supplements the required browser UI. The project brief requires the core journey to work in the browser too.

## How the code works

The frontend sends credentialed `fetch` requests through `frontend/src/api.js`. Vite proxies `/api` and `/uploads` to Express in development. Express mounts separate route files in `backend/app.js`; routes validate input, check the session/role/record owner, and execute parameterized SQL through the MySQL pool in `backend/config/database.js`. JSON responses update the React page. Passwords are bcrypt hashes and sessions use HTTP-only cookies.

### Folder map

```text
frontend/src/
  App.jsx                  Routes, navigation, and page/role components
  LoginCard.jsx            Home sign-in form and stage feedback
  LearningArchitecture3D.jsx  Staircase sign-in feedback using Three.js
  AuthContext.jsx          Current account, login, registration, logout
  api.js                   Fetch wrapper, cookies, and API errors
  main.jsx                 React entry point and CSS imports
  design-system.css        Shared colors, type, controls, surfaces, responsive rules
  styles.css               Base and component styles
  original-theme.css       Existing layout primitives used by pages
backend/
  app.js                   Middleware and route registration
  server.js                MySQL check and Express startup
  config/database.js       mysql2 connection pool
  middleware/              Session auth, image upload, safe API errors
  routes/                  Auth, listings, subjects, bookings, admin
  database/schema.sql      Tables, constraints, and relationships
  database/seed.sql        Fictional demo accounts and records
  database/seed.mjs        Applies schema.sql and seed.sql
  test/                    API guard, upload, and validation tests
postman/                   Importable Postman collection
```

### Main routes and project mapping

| INFO 653 requirement | Implementation |
| --- | --- |
| Register, login, logout, and hashed passwords | `frontend/src/AuthContext.jsx`; `backend/routes/auth.routes.js` |
| Browse records and view details | Tutor directory/detail in `frontend/src/App.jsx`; `GET /api/listings` and `GET /api/listings/:id` |
| Create, update, delete own main records | Tutor listing pages; `backend/routes/listings.routes.js` checks ownership on every write |
| Search/filter | Listing search and filters use parameterized queries in `backend/routes/listings.routes.js` |
| Optional one JPEG/PNG upload up to 2 MB | `backend/middleware/upload.js`; listing form and placeholder in `frontend/src/App.jsx` |
| Validation, safe errors, and helpful missing-record response | `backend/lib/validation.js`, route handlers, `backend/middleware/errors.js`; frontend feedback and empty states |
| Three-table owner/category/main-record structure | `users`, `subjects`, and `tutor_listings` in `backend/database/schema.sql` |

The project also has `bookings` as a fourth table and administrator pages. These are supported extensions for the tutor marketplace; bookings and an admin dashboard are not required by the INFO 653 brief. They do not replace the required owner-controlled listing workflow.

## Design decisions

- The first page presents the login card and staircase together. Typing an email lights the lower steps; entering the password lights the rest; successful login lights the goal and plays a short star animation before taking the user directly to their workspace.
- The shared palette is charcoal, off-white, forest green, and muted brass. The landing page and role workspaces reuse the same brand colors, button treatment, typography, and spacing. The staircase is a focused sign-in cue; other pages use straightforward surfaces and tables.
- Edit design tokens, controls, and responsive behavior in `frontend/src/design-system.css`. Component/layout rules are in `frontend/src/styles.css` and `frontend/src/original-theme.css`. The login stage/card is in `LoginCard.jsx`; the staircase is in `LearningArchitecture3D.jsx`.

## Known limitations and submission notes

- Tutor registration creates a pending account; an administrator must approve it before that tutor can sign in. Seeded tutor accounts are active for the demo.
- Sessions use Express's in-memory store and reset when the API restarts. Images are stored on the local filesystem.
- There is no payment processing, tutor availability calendar, or email delivery. Booking requests use a selected date/time and simple conflict checks.
- Database-backed workflows need a running MySQL server. `testing-report.md` records which checks were actually run and which need local end-to-end verification.
- Replace the team member/contribution placeholders below and confirm the FindMyTutor topic was approved before submitting.

| Team member | Contribution |
| --- | --- |
| _Add name_ | _Add contribution_ |
| _Add name_ | _Add contribution_ |
| _Add name_ | _Add contribution_ |

## Checks

```bash
npm run lint
npm test
npm run build
```
