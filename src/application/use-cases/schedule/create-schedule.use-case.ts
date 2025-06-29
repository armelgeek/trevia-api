import type { Schedule } from '../../../domain/models/schedule.model'
// src/application/use-cases/schedule/create-schedule.use-case.ts
import type { ScheduleRepository } from '../../../domain/repositories/schedule.repository.interface'

export class CreateScheduleUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(
    input: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; data?: Schedule; error?: string }> {
    try {
      const schedule = await this.scheduleRepository.create(input)
      return { success: true, data: schedule }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erreur création schedule' }
    }
  }
}
