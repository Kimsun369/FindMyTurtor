import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createServer } from 'node:http'
import express from 'express'

process.env.UPLOAD_DIR = await mkdtemp(path.join(os.tmpdir(), 'findmytutor-upload-test-'))
const { imageHasValidSignature, imagePath, imageUpload, removeImage, uploadDirectory } = await import('../middleware/upload.js')
const { errorHandler } = await import('../middleware/errors.js')

test('image upload accepts one signed JPEG or PNG and rejects invalid/oversized files', async (context) => {
  const app = express()
  app.post('/upload', imageUpload.single('image'), async (req, res) => {
    if (!(await imageHasValidSignature(req.file))) {
      removeImage(req.file.filename)
      return res.status(400).json({ error: { code: 'INVALID_IMAGE_CONTENT' } })
    }
    res.json({ path: imagePath(req.file), filename: req.file.filename })
  })
  app.use(errorHandler)

  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(uploadDirectory, { recursive: true, force: true })
  })
  const base = `http://127.0.0.1:${server.address().port}/upload`

  async function upload(file, filename = 'test-image') {
    const form = new FormData()
    form.append('image', new Blob([file.bytes], { type: file.type }), filename)
    return fetch(base, { method: 'POST', body: form })
  }

  const jpegBytes = Uint8Array.from([0xff, 0xd8, 0xff, 0x00])
  const jpeg = await upload({ bytes: jpegBytes, type: 'image/jpeg' }, 'photo.jpg')
  assert.equal(jpeg.status, 200)
  const jpegResult = await jpeg.json()
  assert.match(jpegResult.path, /^\/uploads\/[0-9a-f-]+\.jpg$/)
  assert.deepEqual(await readFile(path.join(uploadDirectory, jpegResult.filename)), Buffer.from(jpegBytes))
  removeImage(jpegResult.filename)

  const pngBytes = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])
  const png = await upload({ bytes: pngBytes, type: 'image/png' }, 'photo.png')
  assert.equal(png.status, 200)
  const pngResult = await png.json()
  assert.match(pngResult.path, /^\/uploads\/[0-9a-f-]+\.png$/)
  removeImage(pngResult.filename)

  const unsupported = await upload({ bytes: new Uint8Array([1, 2, 3]), type: 'image/gif' }, 'photo.gif')
  assert.equal(unsupported.status, 400)
  assert.equal((await unsupported.json()).error.code, 'INVALID_IMAGE_TYPE')

  const spoofed = await upload({ bytes: new Uint8Array([1, 2, 3]), type: 'image/jpeg' }, 'not-a-jpeg.jpg')
  assert.equal(spoofed.status, 400)
  assert.equal((await spoofed.json()).error.code, 'INVALID_IMAGE_CONTENT')

  const atLimitBytes = new Uint8Array(2 * 1024 * 1024)
  atLimitBytes.set(jpegBytes)
  const atLimit = await upload({ bytes: atLimitBytes, type: 'image/jpeg' }, 'limit.jpg')
  assert.equal(atLimit.status, 200)
  removeImage((await atLimit.json()).filename)

  const oversized = await upload({ bytes: new Uint8Array(2 * 1024 * 1024 + 1), type: 'image/jpeg' }, 'large.jpg')
  assert.equal(oversized.status, 413)
  assert.equal((await oversized.json()).error.code, 'FILE_TOO_LARGE')

  const multiple = new FormData()
  multiple.append('image', new Blob([jpegBytes], { type: 'image/jpeg' }), 'one.jpg')
  multiple.append('image', new Blob([pngBytes], { type: 'image/png' }), 'two.png')
  const duplicateFiles = await fetch(base, { method: 'POST', body: multiple })
  assert.equal(duplicateFiles.status, 400)
  assert.equal((await duplicateFiles.json()).error.code, 'INVALID_UPLOAD')
})
