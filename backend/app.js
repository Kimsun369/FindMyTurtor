import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import { errorHandler, notFound } from './middleware/errors.js'
import authRoutes from './routes/auth.routes.js'
import listingRoutes from './routes/listings.routes.js'
import subjectRoutes from './routes/subjects.routes.js'
import bookingRoutes from './routes/bookings.routes.js'
import adminRoutes from './routes/admin.routes.js'
import { uploadDirectory } from './middleware/upload.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const app = express()
const clientDist = path.resolve(dirname, 'public')
const allowedOrigin = process.env.CLIENT_ORIGIN || `http://localhost:${process.env.VITE_PORT || 5173}`
if (!process.env.SESSION_SECRET) throw new Error('Set SESSION_SECRET in your local .env file before starting FindMyTutor.')

app.disable('x-powered-by')
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1)
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))
app.use(session({
  name: 'findmytutor.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}))

app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok' } }))
app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/uploads', express.static(uploadDirectory, { fallthrough: false, index: false }))

app.use('/api', notFound)
app.use(express.static(clientDist, { index: false }))
app.get(/.*/, (_req, res, next) => {
  res.sendFile(path.join(clientDist, 'index.html'), (error) => error && next(error))
})
app.use(errorHandler)

export default app
