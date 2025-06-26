// src/domain/repositories/trip.repository.interface.ts
import type { Trip } from '../models/trip.model'
import type { TripFilters } from '../types/trip.type'

export interface TripRepository {
  create: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Trip>
  findById: (id: string) => Promise<Trip | null>
  findAll: (filters?: TripFilters) => Promise<{ data: Trip[]; total: number }>
  update: (id: string, data: Partial<Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Trip | null>
  delete: (id: string) => Promise<boolean>
}
