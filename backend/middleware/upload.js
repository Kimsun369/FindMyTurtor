import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { randomUUID } from 'node:crypto'

export const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || 'backend/uploads')
fs.mkdirSync(uploadDirectory, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = file.mimetype === 'image/png' ? '.png' : '.jpg'
    callback(null, `${randomUUID()}${extension}`)
  },
})

export const imageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      const error = new Error('Only JPEG and PNG images are accepted.')
      error.code = 'INVALID_IMAGE_TYPE'
      return callback(error)
    }
    callback(null, true)
  },
})

export async function imageHasValidSignature(file) {
  if (!file) return true
  const handle = await fs.promises.open(file.path, 'r')
  try {
    const buffer = Buffer.alloc(8)
    const { bytesRead } = await handle.read(buffer, 0, 8, 0)
    const jpeg = bytesRead >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    const png = bytesRead === 8 && buffer.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    return jpeg || png
  } finally {
    await handle.close()
  }
}

export function removeImage(filename) {
  if (!filename) return
  const target = path.resolve(uploadDirectory, path.basename(filename))
  if (!target.startsWith(`${uploadDirectory}${path.sep}`)) return
  fs.promises.unlink(target).catch(() => {})
}

export function imagePath(file) {
  return file ? `/uploads/${path.basename(file.filename)}` : null
}
