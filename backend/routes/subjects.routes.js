import { Router } from 'express'
import { pool } from '../config/database.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { cleanText, requireId } from '../lib/validation.js'

const router = Router()

router.get('/', async (_req, res) => {
  const [rows] = await pool.execute('SELECT subject_id, subject_name, description FROM subjects ORDER BY subject_name')
  res.json({ data: rows })
})

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const subjectName = cleanText(req.body.subject_name, 100)
  const description = cleanText(req.body.description, 2000) || null
  if (subjectName.length < 2) throw new AppError(400, 'Enter a subject name.', 'VALIDATION_ERROR', { subject_name: 'Enter a subject name.' })
  let result
  try {
    ;[result] = await pool.execute('INSERT INTO subjects (subject_name, description) VALUES (?, ?)', [subjectName, description])
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') throw new AppError(409, 'A subject with this name already exists.', 'DUPLICATE_SUBJECT')
    throw error
  }
  res.status(201).json({ message: 'Subject created.', data: { subject_id: result.insertId, subject_name: subjectName, description } })
})

router.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = requireId(req.params.id, 'subject')
  const [existing] = await pool.execute('SELECT subject_id FROM subjects WHERE subject_id = ?', [id])
  if (!existing[0]) throw new AppError(404, 'Subject not found.', 'NOT_FOUND')
  const subjectName = cleanText(req.body.subject_name, 100)
  const description = cleanText(req.body.description, 2000) || null
  if (subjectName.length < 2) throw new AppError(400, 'Enter a subject name.', 'VALIDATION_ERROR', { subject_name: 'Enter a subject name.' })
  let result
  try {
    ;[result] = await pool.execute('UPDATE subjects SET subject_name = ?, description = ? WHERE subject_id = ?', [subjectName, description, id])
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') throw new AppError(409, 'A subject with this name already exists.', 'DUPLICATE_SUBJECT')
    throw error
  }
  res.json({ message: 'Subject updated.', data: { subject_id: id, subject_name: subjectName, description } })
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = requireId(req.params.id, 'subject')
  let result
  try {
    ;[result] = await pool.execute('DELETE FROM subjects WHERE subject_id = ?', [id])
  } catch (error) {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new AppError(409, 'This subject is used by tutor listings. Reassign or remove those listings before deleting the subject.', 'SUBJECT_IN_USE')
    }
    throw error
  }
  if (!result.affectedRows) throw new AppError(404, 'Subject not found.', 'NOT_FOUND')
  res.json({ message: 'Subject deleted.' })
})

export default router
