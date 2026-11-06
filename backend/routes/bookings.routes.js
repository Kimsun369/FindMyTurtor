import { Router } from 'express'
import { pool } from '../config/database.js'
import { currentUser, requireAuth, requireRole } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { bookingStatuses, cleanText, isBookingStatus, requireId, validateBookingDate } from '../lib/validation.js'

const router = Router()
const bookingSelect = `
  SELECT b.booking_id, b.student_id, student.name AS student_name,
    b.tutor_listing_id, l.tutor_id, tutor.name AS tutor_name,
    l.title AS listing_title, s.subject_name, b.requested_date, b.requested_time,
    b.status, b.created_at
  FROM bookings b
  JOIN users student ON student.user_id = b.student_id
  JOIN tutor_listings l ON l.tutor_listing_id = b.tutor_listing_id
  JOIN users tutor ON tutor.user_id = l.tutor_id
  JOIN subjects s ON s.subject_id = l.subject_id`

router.get('/', requireAuth, async (req, res) => {
  const user = currentUser(req)
  const conditions = []
  const values = []
  if (user.role === 'student') {
    conditions.push('b.student_id = ?')
    values.push(user.user_id)
  } else if (user.role === 'tutor') {
    conditions.push('l.tutor_id = ?')
    values.push(user.user_id)
  }
  if (req.query.status) {
    if (!isBookingStatus(req.query.status)) {
      throw new AppError(400, 'Choose a valid booking status.', 'INVALID_FILTER')
    }
    conditions.push('b.status = ?')
    values.push(req.query.status)
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await pool.execute(`${bookingSelect} ${where} ORDER BY b.requested_date DESC, b.requested_time DESC`, values)
  res.json({ data: rows })
})

router.get('/:id', requireAuth, async (req, res) => {
  const id = requireId(req.params.id, 'booking')
  const user = currentUser(req)
  const [rows] = await pool.execute(`${bookingSelect} WHERE b.booking_id = ?`, [id])
  const booking = rows[0]
  if (!booking) throw new AppError(404, 'Booking not found.', 'NOT_FOUND')
  const allowed = user.role === 'admin' ||
    (user.role === 'student' && Number(booking.student_id) === Number(user.user_id)) ||
    (user.role === 'tutor' && Number(booking.tutor_id) === Number(user.user_id))
  if (!allowed) throw new AppError(403, 'You do not have permission to view this booking.', 'FORBIDDEN')
  res.json({ data: booking })
})

router.post('/', requireAuth, requireRole('student'), async (req, res) => {
  const listingId = requireId(req.body.tutor_listing_id, 'tutor listing')
  const date = cleanText(req.body.requested_date, 10)
  const time = cleanText(req.body.requested_time, 5)
  validateBookingDate(date, time)
  const student = currentUser(req)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [listings] = await connection.execute(
      `SELECT l.tutor_listing_id, l.tutor_id FROM tutor_listings l
       JOIN users u ON u.user_id = l.tutor_id
       WHERE l.tutor_listing_id = ? AND l.status = 'available' AND u.role = 'tutor' AND u.account_status = 'active'
       FOR UPDATE`,
      [listingId],
    )
    const listing = listings[0]
    if (!listing) throw new AppError(404, 'This tutor listing is unavailable.', 'LISTING_UNAVAILABLE')
    if (Number(listing.tutor_id) === Number(student.user_id)) throw new AppError(400, 'You cannot book your own tutor listing.', 'SELF_BOOKING')
    const [conflicts] = await connection.execute(
      `SELECT booking_id FROM bookings WHERE tutor_listing_id = ? AND requested_date = ? AND requested_time = ? AND status IN ('pending', 'accepted') LIMIT 1`,
      [listingId, date, `${time}:00`],
    )
    if (conflicts.length) throw new AppError(409, 'That time was just requested by someone else. Choose another time.', 'TIME_TAKEN')
    const [result] = await connection.execute(
      'INSERT INTO bookings (student_id, tutor_listing_id, requested_date, requested_time, status) VALUES (?, ?, ?, ?, ?)',
      [student.user_id, listingId, date, `${time}:00`, 'pending'],
    )
    await connection.commit()
    const [created] = await pool.execute(`${bookingSelect} WHERE b.booking_id = ?`, [result.insertId])
    res.status(201).json({ message: 'Lesson request submitted.', data: created[0] })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

router.patch('/:id/status', requireAuth, async (req, res) => {
  const id = requireId(req.params.id, 'booking')
  const user = currentUser(req)
  const nextStatus = req.body.status
  if (!bookingStatuses.filter((status) => status !== 'pending').includes(nextStatus)) {
    throw new AppError(400, 'Choose accepted, rejected, or cancelled.', 'INVALID_STATUS')
  }
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute(
      `SELECT b.booking_id, b.student_id, b.status, l.tutor_id FROM bookings b
       JOIN tutor_listings l ON l.tutor_listing_id = b.tutor_listing_id WHERE b.booking_id = ? FOR UPDATE`,
      [id],
    )
    const booking = rows[0]
    if (!booking) throw new AppError(404, 'Booking not found.', 'NOT_FOUND')
    const mayManage = user.role === 'admin' ||
      (user.role === 'tutor' && Number(booking.tutor_id) === Number(user.user_id) && ['accepted', 'rejected'].includes(nextStatus)) ||
      (user.role === 'student' && Number(booking.student_id) === Number(user.user_id) && nextStatus === 'cancelled')
    if (!mayManage) throw new AppError(403, 'You do not have permission to change this booking.', 'FORBIDDEN')
    if (booking.status !== 'pending') throw new AppError(409, 'Only pending bookings can be changed.', 'INVALID_TRANSITION')
    await connection.execute('UPDATE bookings SET status = ? WHERE booking_id = ?', [nextStatus, id])
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
  const [updated] = await pool.execute(`${bookingSelect} WHERE b.booking_id = ?`, [id])
  res.json({ message: `Booking ${nextStatus}.`, data: updated[0] })
})

export { bookingSelect }
export default router
