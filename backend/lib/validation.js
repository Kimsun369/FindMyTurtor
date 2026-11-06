import { AppError } from '../middleware/errors.js'

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const validPassword = (value) => typeof value === 'string' && value.length >= 8 && /[A-Z]/.test(value) && /\d/.test(value)
export const bookingStatuses = Object.freeze(['pending', 'accepted', 'rejected', 'cancelled'])
export const isBookingStatus = (value) => bookingStatuses.includes(value)
export const validId = (value) => /^\d+$/.test(String(value || '')) && Number.isSafeInteger(Number(value)) && Number(value) > 0

export function requireId(value, name = 'record') {
  if (!validId(value)) throw new AppError(400, `Choose a valid ${name}.`, 'INVALID_ID')
  return Number(value)
}

export function cleanText(value, max = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export function pagination(query) {
  const page = Math.max(1, Math.min(100000, Number.parseInt(query.page, 10) || 1))
  const limit = Math.max(1, Math.min(100, Number.parseInt(query.limit, 10) || 12))
  return { page, limit, offset: (page - 1) * limit }
}

export function localDateAndTime(timeZone = process.env.APP_TIMEZONE || 'Asia/Phnom_Penh') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return { date: `${value.year}-${value.month}-${value.day}`, time: `${value.hour}:${value.minute}` }
}

export function validateBookingDate(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new AppError(400, 'Choose a valid requested date and time.', 'INVALID_DATETIME')
  }
  const [year, month, day] = date.split('-').map(Number)
  const calendarDate = new Date(Date.UTC(year, month - 1, day))
  if (calendarDate.getUTCFullYear() !== year || calendarDate.getUTCMonth() !== month - 1 || calendarDate.getUTCDate() !== day) {
    throw new AppError(400, 'Choose a valid requested date and time.', 'INVALID_DATETIME')
  }
  const now = localDateAndTime()
  if (date < now.date || (date === now.date && time <= now.time)) {
    throw new AppError(400, 'Choose a future lesson date and time.', 'PAST_DATETIME')
  }
}
