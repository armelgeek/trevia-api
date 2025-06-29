import type { Driver } from '../../../domain/models/driver.model'
import type { DriverRepository } from '../../../domain/repositories/driver.repository.interface'

export class CreateDriverUseCase {
  constructor(private readonly driverRepository: DriverRepository) {}

  execute(input: Omit<Driver, 'id'>): Promise<Driver> {
    return this.driverRepository.create(input)
  }
}
