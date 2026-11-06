export class AppError extends Error {
  constructor(status, message, code = 'REQUEST_ERROR', fields) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function notFound(_req, _res, next) {
  next(new AppError(404, 'The requested resource was not found.', 'NOT_FOUND'))
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: { message: error.message, code: error.code, ...(error.fields ? { fields: error.fields } : {}) },
    })
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { message: 'That email or subject already exists.', code: 'DUPLICATE' } })
  }
  if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: { message: 'Choose an existing subject, tutor, or listing.', code: 'INVALID_REFERENCE' } })
  }
  if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: { message: 'This record is in use and cannot be deleted. Deactivate it instead.', code: 'RECORD_IN_USE' } })
  }
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: { message: 'Images must be 2 MB or smaller.', code: 'FILE_TOO_LARGE' } })
  }
  if (error?.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: { message: 'Upload one image using the image field.', code: 'INVALID_UPLOAD' } })
  }
  if (error?.code === 'INVALID_IMAGE_TYPE') {
    return res.status(400).json({ error: { message: 'Only JPEG and PNG images are accepted.', code: 'INVALID_IMAGE_TYPE' } })
  }
  if (error?.name === 'MulterError') {
    return res.status(400).json({ error: { message: 'The image upload could not be processed.', code: 'INVALID_UPLOAD' } })
  }

  console.error('[api]', error?.message || 'Unknown error')
  return res.status(500).json({ error: { message: 'Something went wrong. Please try again.', code: 'INTERNAL_ERROR' } })
}
