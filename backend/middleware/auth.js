import { AppError } from './errors.js'
import { pool } from '../config/database.js'

export async function refreshSessionUser(req) {
  const [rows] = await pool.execute(
    'SELECT user_id, name, email, role, account_status FROM users WHERE user_id = ? LIMIT 1',
    [req.session.user.user_id],
  )
  const user = rows[0]
  if (!user || user.account_status !== 'active') {
    await new Promise((resolve) => req.session.destroy(() => resolve()))
    throw new AppError(401, 'This account is no longer active. Please sign in again.', 'ACCOUNT_UNAVAILABLE')
  }
  req.session.user = user
  return user
}

export async function requireAuth(req, _res, next) {
  if (!req.session.user) return next(new AppError(401, 'Please log in to continue.', 'AUTH_REQUIRED'))
  try {
    await refreshSessionUser(req)
    req.authenticated = true
    next()
  } catch (error) { next(error) }
}

export function requireRole(...roles) {
  return async (req, _res, next) => {
    if (!req.session.user) return next(new AppError(401, 'Please log in to continue.', 'AUTH_REQUIRED'))
    try {
      const user = req.authenticated ? req.session.user : await refreshSessionUser(req)
      req.authenticated = true
      if (!roles.includes(user.role)) return next(new AppError(403, 'You do not have permission to perform this action.', 'FORBIDDEN'))
      next()
    } catch (error) { next(error) }
  }
}

export function currentUser(req) {
  return req.session.user
}
