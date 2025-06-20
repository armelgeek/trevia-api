import { env } from 'node:process'
import dotenv from 'dotenv'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../schema'

dotenv.config()
if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}
export const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { schema })

// feat: create reservation system - Development on 2025-06-04

// ci: add GitHub Actions workflow - Development on 2025-06-20
