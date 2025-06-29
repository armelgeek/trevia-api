import type { Driver } from '../../../domain/models/driver.model'
import type { DriverRepository } from '../../../domain/repositories/driver.repository.interface'

export class GetDriverUseCase {
  constructor(private readonly driverRepository: DriverRepository) {}

  execute(id: string): Promise<Driver | null> {
    return this.driverRepository.findById(id)
  }
}
