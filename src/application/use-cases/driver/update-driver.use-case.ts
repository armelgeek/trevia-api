import type { Driver } from '../../../domain/models/driver.model'
import type { DriverRepository } from '../../../domain/repositories/driver.repository.interface'

export class UpdateDriverUseCase {
  constructor(private readonly driverRepository: DriverRepository) {}

  execute(id: string, input: Partial<Omit<Driver, 'id'>>): Promise<Driver | null> {
    return this.driverRepository.update(id, input)
  }
}
