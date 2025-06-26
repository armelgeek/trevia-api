import type { Driver } from '../../../domain/models/driver.model'
import type { DriverRepository } from '../../../domain/repositories/driver.repository.interface'

export class ListDriversUseCase {
  constructor(private readonly driverRepository: DriverRepository) {}

  execute(): Promise<Driver[]> {
    return this.driverRepository.findAll()
  }
}
