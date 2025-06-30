// src/domain/repositories/schedule.repository.interface.ts
import type { Schedule } from '../models/schedule.model'
import type { ScheduleFilters } from '../types/schedule.type'

export interface ScheduleRepository {
  create: (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Schedule>
  findById: (id: string) => Promise<Schedule | null>
  findAll: (filters: ScheduleFilters) => Promise<{ data: Schedule[]; total: number }>
  update: (
    id: string,
    data: Partial<Omit<Schedule, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>>
  ) => Promise<Schedule | null>
  delete: (id: string) => Promise<boolean>
  getSchedulesSeats: (
    tripId: string,
    scheduleId?: string,
    status?: string
  ) => Promise<
    Array<{
      scheduleId: string
      departureTime: string
      arrivalTime: string
      vehicleRegistration: string
      vehicleCapacity: number
      seats: Array<{ seatNumber: string; status: string }>
    }>
  >
}
