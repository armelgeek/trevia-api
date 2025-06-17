import type { activityLogs } from '@/infrastructure/database/schema'

export type NewActivityLog = typeof activityLogs.$inferInsert

// test: implement integration tests - Development on 2025-06-12

// feat: add error tracking - Development on 2025-06-17
