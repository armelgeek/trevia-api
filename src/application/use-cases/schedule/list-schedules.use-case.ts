import type { Schedule } from '../../../domain/models/schedule.model'
// src/application/use-cases/schedule/list-schedules.use-case.ts
import type { ScheduleRepository } from '../../../domain/repositories/schedule.repository.interface'
import type { ScheduleFilters } from '../../../domain/types/schedule.type'

export class ListSchedulesUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(
    input: ScheduleFilters & { page?: number; limit?: number }
  ): Promise<{ data: Schedule[]; page: number; limit: number; total: number }> {
    const page = input.page ?? 1
    const limit = input.limit ?? 20
    const { data, total } = await this.scheduleRepository.findAll({ ...input, page, limit })
    return { data, page, limit, total }
  }
}
