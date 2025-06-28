// src/application/use-cases/schedule/get-schedule.use-case.ts
import type { ScheduleRepository } from '../../../domain/repositories/schedule.repository.interface'
import type { Schedule } from '../../../domain/models/schedule.model'

export class GetScheduleUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(id: string): Promise<{ success: boolean; data?: Schedule; error?: string }> {
    const schedule = await this.scheduleRepository.findById(id)
    if (!schedule) {
      return { success: false, error: 'Schedule non trouvé' }
    }
    return { success: true, data: schedule }
  }
}
