import type { TripRepository } from '../../../domain/repositories/trip.repository.interface'
import type { Trip, TripFilters } from '../../../domain/types/trip.type'

export class ListTripsUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  execute(filters?: TripFilters): Promise<{ data: Trip[]; total: number }> {
    return this.tripRepository.findAll(filters)
  }
}
