import 'dotenv/config'
import app from './app.js'
import { checkDatabase, pool } from './config/database.js'

const port = Number(process.env.PORT || 4000)

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be configured in production.')
}

try {
  await checkDatabase()
  app.listen(port, '0.0.0.0', () => {
    console.log(`FindMyTutor API is listening on http://localhost:${port}`)
  })
} catch (error) {
  console.error(`MySQL connection failed: ${error.message}`)
  console.error('Create the database, run backend/database/schema.sql, and check the DB_* values in .env.')
  await pool.end()
  process.exitCode = 1
}
