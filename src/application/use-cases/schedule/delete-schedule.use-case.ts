// src/application/use-cases/schedule/delete-schedule.use-case.ts
import type { ScheduleRepository } from '../../../domain/repositories/schedule.repository.interface'

export class DeleteScheduleUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(id: string): Promise<{ success: boolean; error?: string }> {
    const deleted = await this.scheduleRepository.delete(id)
    if (!deleted) {
      return { success: false, error: 'Schedule non trouvé' }
    }
    return { success: true }
  }
}
