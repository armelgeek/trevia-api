import type { DriverRepository } from '../../../domain/repositories/driver.repository.interface'

export class DeleteDriverUseCase {
  constructor(private readonly driverRepository: DriverRepository) {}

  execute(id: string): Promise<boolean> {
    return this.driverRepository.delete(id)
  }
}
