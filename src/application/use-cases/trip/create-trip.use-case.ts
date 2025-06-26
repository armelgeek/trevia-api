import type { TripRepository } from '../../../domain/repositories/trip.repository.interface'
import type { Trip } from '../../../domain/types/trip.type'

export class CreateTripUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  execute(input: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    return this.tripRepository.create(input)
  }
}
