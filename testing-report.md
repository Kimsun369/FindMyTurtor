# FindMyTutor testing report

Test date: 2026-11-05

## Checks run

| Check | Action / input | Expected result | Actual result | Status |
| --- | --- | --- | --- | --- |
| Production client build | `npm run build` | Vite builds the client and Node parses the API entrypoint | Vite produced the React bundle in `backend/public`; server syntax check succeeded | PASS |
| Development client routes | Start Vite on port 5180 and request public, student, tutor, and admin route URLs | Vite serves the React entry document for client-side routes | 14 requested URLs returned HTTP 200; this checks SPA fallback and does not replace interactive browser tests | PASS (route smoke only) |
| Automated tests | `npm test` with local socket access | API guard, registration validation, listing/password/status validation, upload, date, ID, pagination, and password-hash cases pass | 16 tests pass, 0 fail | PASS |
| Anonymous admin guard | GET `/api/admin/stats` without a session | Return 401 before database access | Returned 401 with `AUTH_REQUIRED` | PASS |
| Anonymous booking guard | GET `/api/bookings` without a session | Return 401 before database access | Returned 401 with `AUTH_REQUIRED` | PASS |
| Public admin registration | POST `/api/auth/register` with role `admin` | Reject public creation of administrator accounts | Returned 400 with `VALIDATION_ERROR` before database access | PASS |
| Invalid registration data | POST registration with invalid name, email, and password | Return structured field validation errors before database access | Returned 400 with `VALIDATION_ERROR` and all three field errors | PASS |
| Anonymous protected actions | Listing, booking, subject, and admin write routes without a session | Return 401 before database access | All seven actions returned `AUTH_REQUIRED` | PASS |
| Listing fee validation | Submit blank fee and zero fee to the shared server validator | Reject blank required fee; accept zero as a valid numeric fee | Blank rejected; zero accepted | PASS |
| Password policy consistency | Check shared policy used by signup and admin-created accounts | Require 8+ characters, uppercase, and a number | Shared validator is used in both routes; test cases passed | PASS |
| Booking status values | Validate the four proposal states | Accept pending, accepted, rejected, cancelled only | Four states accepted; unsupported state rejected | PASS |
| Upload middleware | Signed JPEG/PNG, invalid MIME/signature, one-file limit, 2 MiB boundary | Accept signed JPEG/PNG up to 2 MiB; reject invalid and oversized uploads | JPEG/PNG accepted at limit; unsupported, spoofed, oversized, and multiple-file requests rejected | PASS (middleware test) |
| Demo password hash | bcrypt compare against seeded hash | Documented development password verifies against bcrypt hash | Match confirmed | PASS |
| MySQL schema/seed integration | Run against a clean local MySQL server | Four tables, subjects, 10+ listings, accounts, and bookings are created | Not run: no server was listening on `127.0.0.1:3306`; Docker daemon unavailable | BLOCKED |

The sandbox initially blocked test localhost sockets; the suite passed with local socket access enabled. A private local `.env` now contains a generated session secret, but `npm run dev` still cannot start the API because MySQL is not reachable with the configured local credentials. No database-backed workflow is marked passed without a working MySQL connection.

## Proposal logic review

The source was reviewed against the proposal for the four-table schema, role and ownership checks, parameterized SQL, session cookie settings, listing validation and image limits, booking status transitions, subject deletion constraints, and live administrator counts. Fixes from this review include rejecting blank fees, using the same password policy for admin-created accounts, validating booking status filters, avoiding orphaned uploads for invalid listing IDs, adding administrator booking status controls, protecting seed-managed administrator accounts, and handling unchanged subject/booking updates correctly. This is a code review, not an end-to-end pass. Database-backed behavior remains unverified until tested with MySQL and logged-in browser sessions.

## Required workflow scenarios

`BLOCKED` means the scenario was not exercised end-to-end because no MySQL server was available. It does not mean the feature is known to fail. API authorization, input validation, and the production client build were checked separately above.

| # | Test case | Action / input | Expected result | Actual result | Status |
| ---: | --- | --- | --- | --- | --- |
| 1 | Student registration | Submit valid student details | Active student account is created and signed in | Requires MySQL; not run | BLOCKED |
| 2 | Tutor registration | Submit valid tutor details | Pending tutor account is created | Requires MySQL; not run | BLOCKED |
| 3 | Duplicate email | Register an existing email | Clear duplicate-email response | Requires MySQL; not run | BLOCKED |
| 4 | Invalid registration | Submit invalid fields | Server returns validation errors | Requires MySQL-backed API; not run end-to-end | BLOCKED |
| 5 | Correct login | Sign in with seeded account | Session is created and role workspace opens | Requires MySQL; not run | BLOCKED |
| 6 | Incorrect login | Submit wrong password | Generic invalid credentials response | Requires MySQL; not run | BLOCKED |
| 7 | Logout | Sign out while authenticated | Session is destroyed and cookie cleared | Requires MySQL session; not run | BLOCKED |
| 8 | Protected routes after logout | Request private pages/API without session | Redirect or return 401/403 | Anonymous admin and booking API guards passed; logout flow not run | BLOCKED |
| 9 | Create tutor listing | Submit a valid listing as a tutor | Listing is stored for that tutor | Requires MySQL; not run | BLOCKED |
| 10 | Empty listing title | Submit a listing without a title | Server rejects the listing | Requires MySQL-backed API; not run end-to-end | BLOCKED |
| 11 | Invalid subject ID | Submit a nonexistent subject ID | Server rejects the relationship | Requires MySQL; not run | BLOCKED |
| 12 | Browse listings | Open tutor directory | Active available listings are returned | Requires MySQL; not run | BLOCKED |
| 13 | View listing details | Open an active listing | Tutor, subject, fee, experience, and details render | Requires MySQL; not run | BLOCKED |
| 14 | Keyword search | Search tutor, title, description, or location | Parameterized search narrows results | Requires MySQL; not run | BLOCKED |
| 15 | Subject filter | Filter by a valid subject | Matching listings are returned | Requires MySQL; not run | BLOCKED |
| 16 | Update owned listing | Edit the signed-in tutor's listing | Listing changes are saved | Requires MySQL; not run | BLOCKED |
| 17 | Delete owned listing | Delete own listing without booking history | Listing and image are removed | Requires MySQL; not run | BLOCKED |
| 18 | Edit another tutor's listing | Send a direct API update for another owner | Server returns 403 | Requires MySQL session and records; not run | BLOCKED |
| 19 | Delete another tutor's listing | Send a direct API delete for another owner | Server returns 403 | Requires MySQL session and records; not run | BLOCKED |
| 20 | JPEG upload | Upload a valid JPEG below 2 MB | File is accepted, stored, and served | Middleware validation/storage passed in isolation; listing/database integration not run | PARTIAL |
| 21 | PNG upload | Upload a valid PNG below 2 MB | File is accepted, stored, and served | Middleware validation/storage passed in isolation; listing/database integration not run | PARTIAL |
| 22 | Unsupported image | Upload a non-JPEG/PNG file | Server returns a clear 400 response | Middleware returned `INVALID_IMAGE_TYPE` | PASS (middleware test) |
| 23 | Oversized image | Upload a file over 2 MB | Server returns a clear 413 response | Middleware returned `FILE_TOO_LARGE`; exact 2 MiB accepted | PASS (middleware test) |
| 24 | Missing image | View a listing without an image | Placeholder is displayed | Client build passed; browser/database flow not run | BLOCKED |
| 25 | Submit booking | Student requests an available listing at a future time | Pending booking is stored | Requires MySQL; not run | BLOCKED |
| 26 | Invalid booking | Submit malformed or past date/time | Server rejects it | Date validation unit cases passed; API/database workflow not run | BLOCKED |
| 27 | Student booking history | Open student bookings page | Only that student's bookings appear | Requires MySQL; not run | BLOCKED |
| 28 | Tutor accepts/rejects | Tutor updates a pending booking for their listing | Status changes; another tutor is denied | Requires MySQL; not run | BLOCKED |
| 29 | Unauthorized booking update | Modify another user's booking | Server returns 403 | Requires MySQL session and records; not run | BLOCKED |
| 30 | Student cancellation | Cancel own pending booking | Status becomes cancelled; non-pending is rejected | Requires MySQL; not run | BLOCKED |
| 31 | Admin dashboard | Sign in as seeded administrator | Live counts load from SQL | Requires MySQL; not run | BLOCKED |
| 32 | Role-protected admin page | Open admin dashboard as student/tutor | Access is denied | Requires MySQL sessions; not run | BLOCKED |
| 33 | Manage tutor account | Create, approve, and deactivate tutor accounts | Changes persist and pending tutors cannot sign in | Requires MySQL; not run | BLOCKED |
| 34 | Manage subjects | Create/edit/delete subjects | CRUD works; in-use delete gives a helpful 409 | Requires MySQL; not run | BLOCKED |
| 35 | Manage listings as admin | Search, edit, and delete any listing | Admin changes persist and respect booking constraints | Requires MySQL; not run | BLOCKED |
| 36 | Manage bookings as admin | Filter and update booking records | Admin changes persist | Requires MySQL; not run | BLOCKED |
| 37 | Persistence after restart | Write records, restart API, read them again | Records remain in MySQL | Requires MySQL; not run | BLOCKED |
| 38 | Foreign-key constraints | Delete referenced subject, listing, or user | MySQL rejects delete; API gives helpful error | Requires MySQL; not run | BLOCKED |
| 39 | Fresh schema and seed | Run schema then seed on empty database | Four tables, six subjects, 11 tutor listings, accounts, and sample bookings load | Requires MySQL; not run | BLOCKED |
| 40 | Full browser workflow | Register, log in, browse, CRUD, book, log out | All actions work in a browser | Requires running MySQL and browser session; not run | BLOCKED |

## Environment limitation

At this run, the API could not establish a usable MySQL connection with the project’s local defaults; the server reported root authentication failure and `mysqladmin ping` could not reach the configured TCP port or socket. Configure `.env` for a working MySQL 8.0/8.4 service to execute the blocked database and browser workflows.

`npm audit --omit=dev --audit-level=high` could not reach `registry.npmjs.org` (`ENOTFOUND`), so dependency advisories could not be checked in this run.
