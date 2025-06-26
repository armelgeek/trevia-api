import type { TripRepository } from '../../../domain/repositories/trip.repository.interface'
import type { Trip } from '../../../domain/types/trip.type'

export class UpdateTripUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  execute(id: string, input: Partial<Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Trip | null> {
    return this.tripRepository.update(id, input)
  }
}
