// src/domain/types/trip.type.ts
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface TripFilters {
  routeId?: string
  driverId?: string
  vehicleId?: string
  status?: TripStatus
  dateStart?: string
  dateEnd?: string
  page?: number
  limit?: number
}

export { Trip } from '../models/trip.model'
