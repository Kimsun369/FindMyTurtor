import { Router } from 'express'
import { pool } from '../config/database.js'
import { currentUser, requireAuth, requireRole } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { imageHasValidSignature, imagePath, imageUpload, removeImage } from '../middleware/upload.js'
import { cleanText, pagination, requireId } from '../lib/validation.js'

const router = Router()
const listingSelect = `
  SELECT l.tutor_listing_id, l.tutor_id, u.name AS tutor_name, l.subject_id,
    s.subject_name, l.title, l.description, l.qualification, l.experience,
    l.location, l.teaching_fee, l.image_path, l.status, l.created_at
  FROM tutor_listings l
  JOIN users u ON u.user_id = l.tutor_id
  JOIN subjects s ON s.subject_id = l.subject_id`

export function listingInput(body, file, existingImage = null) {
  const rawFee = typeof body.teaching_fee === 'string' ? body.teaching_fee.trim() : body.teaching_fee
  const value = {
    title: cleanText(body.title, 160),
    description: cleanText(body.description, 5000),
    subject_id: Number(body.subject_id),
    qualification: cleanText(body.qualification, 255) || null,
    experience: body.experience === '' || body.experience == null ? null : Number(body.experience),
    location: cleanText(body.location, 160) || null,
    teaching_fee: rawFee == null || rawFee === '' ? Number.NaN : Number(rawFee),
    status: body.status || 'available',
    image_path: imagePath(file) || existingImage || null,
  }
  const fields = {}
  if (value.title.length < 3) fields.title = 'Enter a listing title (at least 3 characters).'
  if (value.description.length < 10) fields.description = 'Enter a description (at least 10 characters).'
  if (!Number.isInteger(value.subject_id) || value.subject_id < 1) fields.subject_id = 'Choose an existing subject.'
  if (!Number.isFinite(value.teaching_fee) || value.teaching_fee < 0 || value.teaching_fee > 999999.99) {
    fields.teaching_fee = 'Enter a fee between 0 and 999999.99.'
  }
  if (value.experience != null && (!Number.isInteger(value.experience) || value.experience < 0 || value.experience > 70)) {
    fields.experience = 'Experience must be a whole number from 0 to 70.'
  }
  if (!['available', 'unavailable'].includes(value.status)) fields.status = 'Choose available or unavailable.'
  if (Object.keys(fields).length) throw new AppError(400, 'Review the highlighted fields.', 'VALIDATION_ERROR', fields)
  return value
}

function validateListingId(req, _res, next) {
  req.listingId = requireId(req.params.id, 'listing')
  next()
}

async function ensureImageIsReal(file) {
  if (file && !(await imageHasValidSignature(file))) {
    removeImage(file.filename)
    throw new AppError(400, 'The uploaded file is not a valid JPEG or PNG image.', 'INVALID_IMAGE_CONTENT')
  }
}

router.get('/', async (req, res) => {
  const { page, limit, offset } = pagination(req.query)
  const where = ['l.status = ?', 'u.role = ?', 'u.account_status = ?']
  const values = ['available', 'tutor', 'active']
  const search = cleanText(String(req.query.q || ''), 120)
  const subjectId = req.query.subject
  const location = cleanText(String(req.query.location || ''), 160)
  if (search) {
    where.push('(u.name LIKE ? OR l.title LIKE ? OR l.description LIKE ? OR l.location LIKE ?)')
    const term = `%${search}%`
    values.push(term, term, term, term)
  }
  if (subjectId) {
    const id = requireId(subjectId, 'subject')
    where.push('l.subject_id = ?')
    values.push(id)
  }
  if (location) {
    where.push('l.location LIKE ?')
    values.push(`%${location}%`)
  }
  if (req.query.min != null && req.query.min !== '') {
    const min = Number(req.query.min)
    if (!Number.isFinite(min) || min < 0) throw new AppError(400, 'Enter a valid minimum fee.', 'INVALID_FILTER')
    where.push('l.teaching_fee >= ?')
    values.push(min)
  }
  if (req.query.max != null && req.query.max !== '') {
    const max = Number(req.query.max)
    if (!Number.isFinite(max) || max < 0) throw new AppError(400, 'Enter a valid maximum fee.', 'INVALID_FILTER')
    where.push('l.teaching_fee <= ?')
    values.push(max)
  }
  const sortMap = { fee: 'l.teaching_fee ASC', experience: 'l.experience DESC', name: 'u.name ASC', newest: 'l.created_at DESC' }
  const sort = sortMap[req.query.sort] || sortMap.newest
  const whereSql = where.join(' AND ')
  const [rows] = await pool.execute(
    `${listingSelect} WHERE ${whereSql} ORDER BY ${sort}, l.tutor_listing_id DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  )
  const [[count]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM tutor_listings l JOIN users u ON u.user_id = l.tutor_id WHERE ${whereSql}`,
    values,
  )
  const total = Number(count.total)
  res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
})

router.get('/mine', requireAuth, requireRole('tutor', 'admin'), async (req, res) => {
  const ownerId = currentUser(req).role === 'admin' && req.query.tutor_id
    ? requireId(req.query.tutor_id, 'tutor')
    : currentUser(req).user_id
  const [rows] = await pool.execute(`${listingSelect} WHERE l.tutor_id = ? ORDER BY l.created_at DESC`, [ownerId])
  res.json({ data: rows })
})

router.get('/:id', async (req, res) => {
  const id = requireId(req.params.id, 'listing')
  const [rows] = await pool.execute(
    `${listingSelect} WHERE l.tutor_listing_id = ? AND l.status = 'available' AND u.account_status = 'active' AND u.role = 'tutor' LIMIT 1`,
    [id],
  )
  if (!rows[0]) throw new AppError(404, 'This tutor listing is no longer available.', 'NOT_FOUND')
  res.json({ data: rows[0] })
})

router.post('/', requireAuth, requireRole('tutor', 'admin'), imageUpload.single('image'), async (req, res) => {
  await ensureImageIsReal(req.file)
  const user = currentUser(req)
  let tutorId = user.user_id
  if (user.role === 'admin' && req.body.tutor_id) tutorId = requireId(req.body.tutor_id, 'tutor')
  const [tutors] = await pool.execute('SELECT user_id FROM users WHERE user_id = ? AND role = ? AND account_status = ?', [tutorId, 'tutor', 'active'])
  if (!tutors[0]) {
    if (req.file) removeImage(req.file.filename)
    throw new AppError(400, 'Choose an active tutor account for this listing.', 'INVALID_TUTOR')
  }
  let input
  try {
    input = listingInput(req.body, req.file)
  } catch (error) {
    if (req.file) removeImage(req.file.filename)
    throw error
  }
  let result
  try {
    ;[result] = await pool.execute(
      `INSERT INTO tutor_listings (tutor_id, subject_id, title, description, qualification, experience, location, teaching_fee, image_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tutorId, input.subject_id, input.title, input.description, input.qualification, input.experience, input.location, input.teaching_fee, input.image_path, input.status],
    )
  } catch (error) {
    if (req.file) removeImage(req.file.filename)
    throw error
  }
  const [rows] = await pool.execute(`${listingSelect} WHERE l.tutor_listing_id = ?`, [result.insertId])
  res.status(201).json({ message: 'Tutor listing created.', data: rows[0] })
})

router.patch('/:id', requireAuth, requireRole('tutor', 'admin'), validateListingId, imageUpload.single('image'), async (req, res) => {
  const id = req.listingId
  const user = currentUser(req)
  const [rows] = await pool.execute('SELECT * FROM tutor_listings WHERE tutor_listing_id = ?', [id])
  const existing = rows[0]
  if (!existing) {
    if (req.file) removeImage(req.file.filename)
    throw new AppError(404, 'Tutor listing not found.', 'NOT_FOUND')
  }
  if (user.role !== 'admin' && Number(existing.tutor_id) !== Number(user.user_id)) {
    if (req.file) removeImage(req.file.filename)
    throw new AppError(403, 'You can only edit your own tutor listings.', 'FORBIDDEN')
  }
  await ensureImageIsReal(req.file)
  let input
  try {
    input = listingInput({ ...existing, ...req.body, subject_id: req.body.subject_id ?? existing.subject_id,
      teaching_fee: req.body.teaching_fee ?? existing.teaching_fee, experience: req.body.experience ?? existing.experience,
      status: req.body.status ?? existing.status }, req.file, existing.image_path)
  } catch (error) {
    if (req.file) removeImage(req.file.filename)
    throw error
  }
  const tutorId = user.role === 'admin' && req.body.tutor_id ? requireId(req.body.tutor_id, 'tutor') : existing.tutor_id
  if (Number(tutorId) !== Number(existing.tutor_id)) {
    const [tutors] = await pool.execute('SELECT user_id FROM users WHERE user_id = ? AND role = ? AND account_status = ?', [tutorId, 'tutor', 'active'])
    if (!tutors[0]) {
      if (req.file) removeImage(req.file.filename)
      throw new AppError(400, 'Choose an active tutor account.', 'INVALID_TUTOR')
    }
  }
  try {
    await pool.execute(
      `UPDATE tutor_listings SET tutor_id = ?, subject_id = ?, title = ?, description = ?, qualification = ?, experience = ?, location = ?, teaching_fee = ?, image_path = ?, status = ?
       WHERE tutor_listing_id = ?`,
      [tutorId, input.subject_id, input.title, input.description, input.qualification, input.experience, input.location, input.teaching_fee, input.image_path, input.status, id],
    )
  } catch (error) {
    if (req.file) removeImage(req.file.filename)
    throw error
  }
  if (req.file && existing.image_path) removeImage(existing.image_path)
  const [updated] = await pool.execute(`${listingSelect} WHERE l.tutor_listing_id = ?`, [id])
  res.json({ message: 'Tutor listing updated.', data: updated[0] })
})

router.delete('/:id', requireAuth, requireRole('tutor', 'admin'), async (req, res) => {
  const id = requireId(req.params.id, 'listing')
  const user = currentUser(req)
  const [rows] = await pool.execute('SELECT tutor_id, image_path FROM tutor_listings WHERE tutor_listing_id = ?', [id])
  const listing = rows[0]
  if (!listing) throw new AppError(404, 'Tutor listing not found.', 'NOT_FOUND')
  if (user.role !== 'admin' && Number(listing.tutor_id) !== Number(user.user_id)) {
    throw new AppError(403, 'You can only delete your own tutor listings.', 'FORBIDDEN')
  }
  try {
    await pool.execute('DELETE FROM tutor_listings WHERE tutor_listing_id = ?', [id])
  } catch (error) {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new AppError(409, 'This listing has booking history and cannot be deleted. Mark it unavailable to stop new requests.', 'LISTING_HAS_BOOKINGS')
    }
    throw error
  }
  removeImage(listing.image_path)
  res.json({ message: 'Tutor listing deleted.' })
})

export { listingSelect }
export default router
