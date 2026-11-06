# Frontend guide

This folder contains the FindMyTutor browser application. It is written in JavaScript and JSX with React, React Router, and Vite. It does not contain MySQL queries or decide who is allowed to change database records; it calls the Express API for those tasks.

## Proposal requirements covered here

| Proposal requirement | Where it appears |
| --- | --- |
| Home page and tutor discovery | `src/App.jsx` (`Home`, `BrowsePage`) |
| Search by name, listing text, location, and subject | Tutor directory filter form; results come from `/api/listings` |
| View tutor and lesson details | `TutorDetail` at `/tutors/:id` |
| Student registration and login | `AuthPage` at `/register` and `/login` |
| Student dashboard and bookings | `StudentDashboard`, `BookingsPage`, `BookingDetail` |
| Tutor dashboard and listing CRUD | `TutorDashboard`, `MyListings`, `ListingEditor` |
| Tutor booking responses | Requests page and the accept/decline actions in `BookingTable` |
| Administrator overview and management pages | `AdminDashboard`, `AdminUsers`, `AdminSubjects`, `AdminListings`, `BookingsPage` |
| Responsive layout, empty states, feedback, and confirmation | `src/styles.css` and the shared page/form components |

## How it works

`src/main.jsx` mounts React Router and the session-aware `AuthProvider`. `src/api.js` sends requests to the backend with browser credentials so the HTTP-only session cookie is used. The router guards student, tutor, and administrator workspaces for navigation; the backend repeats every important role and ownership check before changing data.

The frontend never includes tutor, subject, booking, or dashboard sample records. Seed records live in MySQL and are loaded through the API. A missing record or an empty result is shown as an empty state rather than fabricated content.

## Run and build

From the project root, start both the Vite frontend and Express backend with `npm run dev`. Vite serves this folder on port 5173 by default and proxies `/api` and `/uploads` to the backend. Build the browser assets with `npm run build`; Express serves the result from `backend/public`.
