// src/application/use-cases/schedule/get-schedules-seats.use-case.ts
import { eq } from 'drizzle-orm'
import type { ScheduleRepository } from '../../../domain/repositories/schedule.repository.interface'
import { db } from '../../../infrastructure/database/db'
import { seats } from '../../../infrastructure/database/schema/schema'

export class GetSchedulesSeatsUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(tripId: string) {
    // Récupère tous les schedules du voyage
    const { data: schedules } = await this.scheduleRepository.findAll({ tripId })
    // Pour chaque schedule, récupère les sièges et leur statut
    const results = await Promise.all(
      schedules.map(async (schedule) => {
        const seatList = await db
          .select({ seatNumber: seats.seatNumber, status: seats.seatType })
          .from(seats)
          .where(eq(seats.scheduleId, schedule.id))
        // TODO: remplacer status par le vrai statut (free/occupied) selon les réservations
        return {
          scheduleId: schedule.id,
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          seats: seatList.map((s) => ({ seatNumber: s.seatNumber, status: s.status || 'free' }))
        }
      })
    )
    return { success: true, data: results }
  }
}
