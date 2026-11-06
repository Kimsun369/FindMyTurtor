import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
})

try {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
  const seed = await readFile(new URL('./seed.sql', import.meta.url), 'utf8')
  await connection.query(schema)
  await connection.query(seed)
  console.log('FindMyTutor schema is ready and demo records are seeded.')
} finally {
  await connection.end()
}
