// src/domain/repositories/trip.repository.interface.ts
import type { Trip } from '../models/trip.model'
import type { TripFilters } from '../types/trip.type'

export interface TripRepository {
  create: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Trip>
  findById: (id: string) => Promise<Trip | null>
  findAll: (filters?: TripFilters) => Promise<{ data: Trip[]; total: number }>
  update: (id: string, data: Partial<Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Trip | null>
  delete: (id: string) => Promise<boolean>
  /**
   * Retourne les voyages triés par popularité (nombre de réservations), paginés, avec prix, horaires et durée
   */
  findByPopularity: (page?: number, limit?: number) => Promise<{
    data: Array<{
      tripId: string
      routeLabel: string
      departureDate: string | null
      bookingsCount: number
      price: number | null
      availableTimes: string[]
      duration: number | null
      driverName: string | null
      vehicleModel: string | null
    }>
    page: number
    limit: number
    total: number
  }>
}
