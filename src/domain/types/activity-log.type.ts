import type { activityLogs } from '@/infrastructure/database/schema'

export type NewActivityLog = typeof activityLogs.$inferInsert

// test: implement integration tests - Development on 2025-06-12
