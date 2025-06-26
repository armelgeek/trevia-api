import type { TripRepository } from '../../../domain/repositories/trip.repository.interface'
import type { Trip } from '../../../domain/types/trip.type'

export class GetTripUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  execute(id: string): Promise<Trip | null> {
    return this.tripRepository.findById(id)
  }
}
