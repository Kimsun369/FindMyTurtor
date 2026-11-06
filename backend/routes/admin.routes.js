import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'
import { currentUser, requireAuth, requireRole } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { bookingSelect } from './bookings.routes.js'
import { listingSelect } from './listings.routes.js'
import { bookingStatuses, cleanText, emailPattern, isBookingStatus, pagination, requireId, validPassword } from '../lib/validation.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

router.get('/stats', async (_req, res) => {
  const [[stats]] = await pool.execute(`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
      (SELECT COUNT(*) FROM users WHERE role = 'tutor') AS total_tutors,
      (SELECT COUNT(*) FROM tutor_listings) AS total_listings,
      (SELECT COUNT(*) FROM bookings) AS total_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings`)
  res.json({ data: stats })
})

router.get('/users', async (req, res) => {
  const { page, limit, offset } = pagination(req.query)
  const where = []
  const values = []
  if (req.query.role) {
    if (!['student', 'tutor', 'admin'].includes(req.query.role)) throw new AppError(400, 'Choose a valid role filter.', 'INVALID_FILTER')
    where.push('role = ?'); values.push(req.query.role)
  }
  if (req.query.status) {
    if (!['pending', 'active', 'deactivated'].includes(req.query.status)) throw new AppError(400, 'Choose a valid account status filter.', 'INVALID_FILTER')
    where.push('account_status = ?'); values.push(req.query.status)
  }
  const search = cleanText(String(req.query.q || ''), 120)
  if (search) { where.push('(name LIKE ? OR email LIKE ?)'); values.push(`%${search}%`, `%${search}%`) }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const [users] = await pool.execute(
    `SELECT user_id, name, email, role, account_status, created_at FROM users ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  )
  const [[count]] = await pool.execute(`SELECT COUNT(*) AS total FROM users ${whereSql}`, values)
  const total = Number(count.total)
  res.json({ data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
})

router.post('/users', async (req, res) => {
  const name = cleanText(req.body.name, 120)
  const email = cleanText(req.body.email, 254).toLowerCase()
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  const role = req.body.role
  const fields = {}
  if (name.length < 2) fields.name = 'Enter a name with at least 2 characters.'
  if (!emailPattern.test(email)) fields.email = 'Enter a valid email address.'
  if (!validPassword(password)) {
    fields.password = 'Use at least 8 characters, including an uppercase letter and a number.'
  }
  if (!['student', 'tutor'].includes(role)) fields.role = 'Choose Student or Tutor.'
  if (Object.keys(fields).length) throw new AppError(400, 'Review the highlighted fields.', 'VALIDATION_ERROR', fields)
  const status = role === 'tutor' ? (req.body.account_status === 'active' ? 'active' : 'pending') : 'active'
  const passwordHash = await bcrypt.hash(password, 12)
  let result
  try {
    ;[result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role, account_status) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, status],
    )
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') throw new AppError(409, 'That email is already assigned to an account.', 'DUPLICATE_EMAIL')
    throw error
  }
  res.status(201).json({ message: 'Account created.', data: { user_id: result.insertId, name, email, role, account_status: status } })
})

router.patch('/users/:id', async (req, res) => {
  const id = requireId(req.params.id, 'user')
  const name = cleanText(req.body.name, 120)
  const email = cleanText(req.body.email, 254).toLowerCase()
  const status = req.body.account_status
  const role = req.body.role
  const [rows] = await pool.execute('SELECT user_id, role, account_status FROM users WHERE user_id = ?', [id])
  const existing = rows[0]
  if (!existing) throw new AppError(404, 'User not found.', 'NOT_FOUND')
  if (existing.role === 'admin' && (role !== 'admin' || status !== 'active')) {
    throw new AppError(403, 'Administrator access is managed through the secure seed process.', 'ADMIN_SEED_ONLY')
  }
  if (id === Number(currentUser(req).user_id) && (status === 'deactivated' || role !== 'admin')) {
    throw new AppError(400, 'You cannot deactivate or change your own administrator account.', 'SELF_DEACTIVATION')
  }
  if (name.length < 2 || !emailPattern.test(email) || !['student', 'tutor', 'admin'].includes(role) || !['pending', 'active', 'deactivated'].includes(status)) {
    throw new AppError(400, 'Enter a name, valid email, role, and account status.', 'VALIDATION_ERROR')
  }
  if (role !== existing.role) {
    if (role === 'admin' || existing.role === 'admin') {
      throw new AppError(403, 'Administrator accounts are provisioned through the secure seed process.', 'ADMIN_SEED_ONLY')
    }
    const [[usage]] = await pool.execute(
      `SELECT
        (SELECT COUNT(*) FROM tutor_listings WHERE tutor_id = ?) AS listings,
        (SELECT COUNT(*) FROM bookings WHERE student_id = ? OR tutor_listing_id IN (SELECT tutor_listing_id FROM tutor_listings WHERE tutor_id = ?)) AS bookings`,
      [id, id, id],
    )
    if (Number(usage.listings) || Number(usage.bookings)) {
      throw new AppError(409, 'This user has tutor listings or booking history. Keep their role and deactivate the account instead.', 'USER_HAS_HISTORY')
    }
  }
  try {
    await pool.execute('UPDATE users SET name = ?, email = ?, role = ?, account_status = ? WHERE user_id = ?', [name, email, role, status, id])
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') throw new AppError(409, 'That email is already assigned to another account.', 'DUPLICATE_EMAIL')
    throw error
  }
  res.json({ message: 'Account updated.', data: { user_id: id, name, email, role, account_status: status } })
})

router.delete('/users/:id', async (req, res) => {
  const id = requireId(req.params.id, 'user')
  if (id === Number(currentUser(req).user_id)) throw new AppError(400, 'You cannot delete your own administrator account.', 'SELF_DELETE')
  const [users] = await pool.execute('SELECT role FROM users WHERE user_id = ?', [id])
  if (!users[0]) throw new AppError(404, 'User not found.', 'NOT_FOUND')
  if (users[0].role === 'admin') throw new AppError(403, 'Administrator accounts are managed through the secure seed process.', 'ADMIN_SEED_ONLY')
  const [result] = await pool.execute('DELETE FROM users WHERE user_id = ?', [id])
  if (!result.affectedRows) throw new AppError(404, 'User not found.', 'NOT_FOUND')
  res.json({ message: 'Account deleted.' })
})

router.get('/listings', async (req, res) => {
  const search = cleanText(String(req.query.q || ''), 120)
  const values = []
  let where = ''
  if (search) {
    where = 'WHERE (u.name LIKE ? OR l.title LIKE ? OR l.location LIKE ? OR s.subject_name LIKE ?)'
    const term = `%${search}%`; values.push(term, term, term, term)
  }
  const [rows] = await pool.execute(`${listingSelect} ${where} ORDER BY l.created_at DESC`, values)
  res.json({ data: rows })
})

router.get('/listings/:id', async (req, res) => {
  const id = requireId(req.params.id, 'listing')
  const [rows] = await pool.execute(`${listingSelect} WHERE l.tutor_listing_id = ?`, [id])
  if (!rows[0]) throw new AppError(404, 'Tutor listing not found.', 'NOT_FOUND')
  res.json({ data: rows[0] })
})

router.get('/bookings', async (req, res) => {
  const values = []
  let where = ''
  if (req.query.status) {
    if (!isBookingStatus(req.query.status)) throw new AppError(400, 'Choose a valid booking status.', 'INVALID_FILTER')
    where = 'WHERE b.status = ?'; values.push(req.query.status)
  }
  const [rows] = await pool.execute(`${bookingSelect} ${where} ORDER BY b.created_at DESC`, values)
  res.json({ data: rows })
})

router.patch('/bookings/:id/status', async (req, res) => {
  const id = requireId(req.params.id, 'booking')
  const status = req.body.status
  if (!isBookingStatus(status)) throw new AppError(400, 'Choose a valid booking status.', 'INVALID_STATUS')
  const [existing] = await pool.execute('SELECT booking_id FROM bookings WHERE booking_id = ?', [id])
  if (!existing[0]) throw new AppError(404, 'Booking not found.', 'NOT_FOUND')
  await pool.execute('UPDATE bookings SET status = ? WHERE booking_id = ?', [status, id])
  const [rows] = await pool.execute(`${bookingSelect} WHERE b.booking_id = ?`, [id])
  res.json({ message: 'Booking updated.', data: rows[0] })
})

router.get('/subjects', async (_req, res) => {
  const [rows] = await pool.execute('SELECT subject_id, subject_name, description FROM subjects ORDER BY subject_name')
  res.json({ data: rows })
})

export default router
