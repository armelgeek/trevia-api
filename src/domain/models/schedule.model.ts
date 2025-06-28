// src/domain/models/schedule.model.ts
export interface Schedule {
  id: string
  tripId?: string
  departureTime: string
  arrivalTime: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  createdAt?: string
  updatedAt?: string
}
