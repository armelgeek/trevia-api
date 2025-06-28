// src/application/use-cases/schedule/update-schedule.use-case.ts
import type { ScheduleRepository } from '../../../domain/repositories/schedule.repository.interface'
import type { Schedule } from '../../../domain/models/schedule.model'

export class UpdateScheduleUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(id: string, input: Partial<Omit<Schedule, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>>): Promise<{ success: boolean; data?: Schedule; error?: string }> {
    const updated = await this.scheduleRepository.update(id, input)
    if (!updated) {
      return { success: false, error: 'Schedule non trouvé' }
    }
    return { success: true, data: updated }
  }
}
