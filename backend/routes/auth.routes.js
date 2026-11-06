import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { promisify } from 'node:util'
import { pool } from '../config/database.js'
import { refreshSessionUser } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { cleanText, emailPattern, validPassword } from '../lib/validation.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const regenerateSession = promisify((session, callback) => session.regenerate(callback))

router.post('/register', async (req, res) => {
  const name = cleanText(req.body.name, 120)
  const email = cleanText(req.body.email, 254).toLowerCase()
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  const role = req.body.role
  const fields = {}
  if (name.length < 2) fields.name = 'Enter your full name.'
  if (!emailPattern.test(email)) fields.email = 'Enter a valid email address.'
  if (!validPassword(password)) {
    fields.password = 'Use at least 8 characters, including an uppercase letter and a number.'
  }
  if (!['student', 'tutor'].includes(role)) fields.role = 'Choose Student or Tutor.'
  if (Object.keys(fields).length) throw new AppError(400, 'Review the highlighted fields.', 'VALIDATION_ERROR', fields)

  const passwordHash = await bcrypt.hash(password, 12)
  const accountStatus = role === 'tutor' ? 'pending' : 'active'
  let result
  try {
    ;[result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role, account_status) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, accountStatus],
    )
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') throw new AppError(409, 'This email is already registered.', 'DUPLICATE_EMAIL')
    throw error
  }
  if (role === 'tutor') {
    return res.status(201).json({
      message: 'Tutor account created. An administrator must approve it before you can sign in.',
      data: { user: { user_id: result.insertId, name, email, role, account_status: accountStatus } },
    })
  }

  await regenerateSession(req.session)
  req.session.user = { user_id: result.insertId, name, email, role, account_status: accountStatus }
  return res.status(201).json({ message: 'Your account is ready.', data: { user: req.session.user } })
})

router.post('/login', async (req, res) => {
  const email = cleanText(req.body.email, 254).toLowerCase()
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  if (!emailPattern.test(email) || !password) {
    throw new AppError(400, 'Enter a valid email and password.', 'VALIDATION_ERROR')
  }
  const [rows] = await pool.execute(
    'SELECT user_id, name, email, password_hash, role, account_status FROM users WHERE email = ? LIMIT 1',
    [email],
  )
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS')
  }
  if (user.account_status !== 'active') {
    throw new AppError(403, user.account_status === 'pending' ? 'Your tutor account is awaiting administrator approval.' : 'This account is currently deactivated.', 'ACCOUNT_UNAVAILABLE')
  }
  await regenerateSession(req.session)
  delete user.password_hash
  req.session.user = user
  res.json({ message: 'Welcome back.', data: { user } })
})

router.post('/logout', requireAuth, async (req, res) => {
  await promisify((callback) => req.session.destroy(callback))()
  res.clearCookie('findmytutor.sid')
  res.json({ message: 'You are signed out.' })
})

router.get('/me', async (req, res, next) => {
  if (!req.session.user) return res.json({ data: { user: null } })
  try {
    await refreshSessionUser(req)
    res.json({ data: { user: req.session.user } })
  } catch (error) {
    if (error?.code === 'ACCOUNT_UNAVAILABLE') return res.json({ data: { user: null } })
    next(error)
  }
})

router.patch('/profile', requireAuth, async (req, res) => {
  const name = cleanText(req.body.name, 120)
  if (name.length < 2) throw new AppError(400, 'Enter your full name.', 'VALIDATION_ERROR', { name: 'Enter your full name.' })
  const user = req.session.user
  await pool.execute('UPDATE users SET name = ? WHERE user_id = ?', [name, user.user_id])
  req.session.user = { ...user, name }
  res.json({ message: 'Profile updated.', data: { user: req.session.user } })
})

export default router
