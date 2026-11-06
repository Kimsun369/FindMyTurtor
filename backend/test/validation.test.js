import test from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import { bookingStatuses, isBookingStatus, pagination, requireId, validateBookingDate, localDateAndTime, validPassword } from '../lib/validation.js'
import { listingInput } from '../routes/listings.routes.js'

test('requireId accepts positive integer identifiers', () => {
  assert.equal(requireId('12', 'listing'), 12)
})

test('requireId rejects invalid and zero identifiers', () => {
  assert.throws(() => requireId('0'), { code: 'INVALID_ID' })
  assert.throws(() => requireId('1; DROP TABLE users'), { code: 'INVALID_ID' })
})

test('pagination clamps sizes and defaults invalid values', () => {
  assert.deepEqual(pagination({ page: '0', limit: '500' }), { page: 1, limit: 100, offset: 0 })
  assert.deepEqual(pagination({ page: '3', limit: '12' }), { page: 3, limit: 12, offset: 24 })
})

test('account passwords follow one shared strength rule', () => {
  assert.equal(validPassword('CoursePass123'), true)
  assert.equal(validPassword('lowercase123'), false)
  assert.equal(validPassword('Short1'), false)
  assert.equal(validPassword(''), false)
})

test('booking status validation accepts only the four proposal states', () => {
  assert.deepEqual(bookingStatuses, ['pending', 'accepted', 'rejected', 'cancelled'])
  for (const status of bookingStatuses) assert.equal(isBookingStatus(status), true)
  assert.equal(isBookingStatus('approved'), false)
})

test('tutor listing validation requires a non-empty teaching fee', () => {
  const listing = { title: 'Math tutor', description: 'Personalized math support', subject_id: '1', teaching_fee: '', status: 'available' }
  assert.throws(() => listingInput(listing), { code: 'VALIDATION_ERROR' })
  assert.equal(listingInput({ ...listing, teaching_fee: '0' }).teaching_fee, 0)
})

test('booking validation rejects malformed and impossible dates', () => {
  assert.throws(() => validateBookingDate('2027-02-30', '10:30'), { code: 'INVALID_DATETIME' })
  assert.throws(() => validateBookingDate('2027-02-12', '25:30'), { code: 'INVALID_DATETIME' })
})

test('booking validation rejects past dates and accepts a future date', () => {
  assert.throws(() => validateBookingDate('2000-01-01', '10:00'), { code: 'PAST_DATETIME' })
  const now = localDateAndTime()
  const tomorrow = new Date(`${now.date}T12:00:00`)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  assert.doesNotThrow(() => validateBookingDate(date, '10:00'))
})

test('seeded demo password is stored as a verifiable bcrypt hash', async () => {
  const hash = '$2b$12$L927bWk3FW8igFKcZTAQUeP6kl43Qke6zH3Eg2/ZUVIwOyZBt3C8K'
  assert.equal(await bcrypt.compare('DemoPass123!', hash), true)
})
