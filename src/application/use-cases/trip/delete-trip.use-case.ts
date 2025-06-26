import type { TripRepository } from '../../../domain/repositories/trip.repository.interface'

export class DeleteTripUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  execute(id: string): Promise<boolean> {
    return this.tripRepository.delete(id)
  }
}
