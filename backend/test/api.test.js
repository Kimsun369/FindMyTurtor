import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'

process.env.SESSION_SECRET ||= 'test-only-session-secret'
const { default: app } = await import('../app.js')

test('health route reports a running API without requiring MySQL', async (context) => {
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => new Promise((resolve) => server.close(resolve)))
  const address = server.address()
  const response = await fetch(`http://127.0.0.1:${address.port}/api/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { data: { status: 'ok' } })
})

test('protected admin routes reject anonymous requests before database access', async (context) => {
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => new Promise((resolve) => server.close(resolve)))
  const address = server.address()
  const response = await fetch(`http://127.0.0.1:${address.port}/api/admin/stats`)
  assert.equal(response.status, 401)
  const body = await response.json()
  assert.equal(body.error.code, 'AUTH_REQUIRED')
})

test('authenticated-only booking routes reject anonymous requests', async (context) => {
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => new Promise((resolve) => server.close(resolve)))
  const address = server.address()
  const response = await fetch(`http://127.0.0.1:${address.port}/api/bookings`)
  assert.equal(response.status, 401)
  assert.equal((await response.json()).error.code, 'AUTH_REQUIRED')
})

test('public registration cannot create administrator accounts', async (context) => {
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => new Promise((resolve) => server.close(resolve)))
  const address = server.address()
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Public Admin', email: 'admin@example.test', password: 'CoursePass123', role: 'admin' }),
  })
  assert.equal(response.status, 400)
  assert.equal((await response.json()).error.code, 'VALIDATION_ERROR')
})

test('invalid public registration data is rejected before database access', async (context) => {
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => new Promise((resolve) => server.close(resolve)))
  const address = server.address()
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short', role: 'student' }),
  })
  assert.equal(response.status, 400)
  const body = await response.json()
  assert.equal(body.error.code, 'VALIDATION_ERROR')
  assert.ok(body.error.fields.name)
  assert.ok(body.error.fields.email)
  assert.ok(body.error.fields.password)
})

test('anonymous users cannot perform protected proposal actions', async (context) => {
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => new Promise((resolve) => server.close(resolve)))
  const address = server.address()
  const base = `http://127.0.0.1:${address.port}`
  const actions = [
    ['POST', '/api/listings', {}],
    ['PATCH', '/api/listings/1', {}],
    ['DELETE', '/api/listings/1'],
    ['POST', '/api/bookings', {}],
    ['PATCH', '/api/bookings/1/status', { status: 'accepted' }],
    ['POST', '/api/subjects', { subject_name: 'Astronomy' }],
    ['PATCH', '/api/admin/users/1', { account_status: 'active' }],
  ]
  for (const [method, route, payload] of actions) {
    const response = await fetch(`${base}${route}`, {
      method,
      headers: { 'content-type': 'application/json' },
      ...(method === 'DELETE' ? {} : { body: JSON.stringify(payload) }),
    })
    assert.equal(response.status, 401, `${method} ${route} should require a session`)
    assert.equal((await response.json()).error.code, 'AUTH_REQUIRED')
  }
})
