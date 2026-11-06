# Backend guide

This folder contains the JavaScript Express API, MySQL schema, seed data, and automated checks for the FindMyTutor proposal. MySQL is the source of truth for users, subjects, tutor listings, and bookings.

## Proposal requirements covered here

| Proposal requirement | Implementation |
| --- | --- |
| Exactly four application tables | `database/schema.sql`: `users`, `subjects`, `tutor_listings`, `bookings` |
| Foreign keys and safe deletes | `database/schema.sql` uses indexed foreign keys with `RESTRICT` for records with history |
| Seed data and secure admin setup | `database/seed.sql`; demo passwords are bcrypt hashes, and admin accounts are not publicly registerable |
| Session login, logout, and roles | `routes/auth.routes.js`, `middleware/auth.js`, `app.js` |
| Tutor listing CRUD and ownership | `routes/listings.routes.js` checks the signed-in tutor or administrator on every write |
| Search and subject filtering | `GET /api/listings` uses parameterized MySQL search and filters |
| JPEG/PNG uploads, one image, 2 MB maximum | `middleware/upload.js` validates MIME type, file signature, size, and generated filename |
| Student bookings and tutor decisions | `routes/bookings.routes.js` validates dates, availability, self-booking, ownership, and status transitions |
| Administrator counts and management | `routes/admin.routes.js` runs live SQL counts and protects account/listing/booking operations |
| Structured errors and SQL injection protection | `middleware/errors.js` returns safe API errors; user values use mysql2 prepared statements |

## Four-table relationship summary

- Each tutor listing belongs to one tutor (`users`) and one subject (`subjects`).
- Each booking belongs to one student (`users`) and one tutor listing (`tutor_listings`). The tutor for the booking is derived through its listing.
- Foreign keys prevent removing subjects, listings, or accounts that still have dependent records. The API returns a helpful response and users can deactivate accounts or listings instead.
- Sessions use Express's in-memory store for this single-process classroom app, so session storage does not add a fifth application table.

## Start and seed

Configure the local MySQL credentials and a private session secret in the root `.env` file. From the project root, run `npm run seed` to apply `database/schema.sql` and then `database/seed.sql`. Start frontend and backend together with `npm run dev`; the API listens on port 4000 by default.

## Checks and limits

Run `npm test` from the root to execute the Node test suite. `../testing-report.md` distinguishes checks that passed from database workflows that need a running MySQL service. Do not claim those integration scenarios passed until they are run against MySQL.
