// src/domain/types/schedule.type.ts
export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface ScheduleFilters {
  tripId: string // Obligatoire
  page?: number
  limit?: number
}

export { Schedule } from '../models/schedule.model'
