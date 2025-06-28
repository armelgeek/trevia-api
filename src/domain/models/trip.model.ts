// src/domain/models/trip.model.ts
import type { TripStatus } from '../types/trip.type'

export interface Trip {
  id?: string
  routeId: string
  driverId: string
  vehicleId: string
  departureDate: string | null
  status: TripStatus
  price: string | null
  createdAt: string
  updatedAt: string
}
