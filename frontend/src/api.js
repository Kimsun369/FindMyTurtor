export class ApiError extends Error {
  constructor(message, status, code, fields) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields || {}
  }
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const isForm = options.body instanceof FormData
  if (options.body && !isForm && typeof options.body !== 'string') {
    headers.set('Content-Type', 'application/json')
    options = { ...options, body: JSON.stringify(options.body) }
  }
  const response = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(payload?.error?.message || 'The request could not be completed.', response.status, payload?.error?.code, payload?.error?.fields)
  }
  return payload
}

export function errorText(error) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}
