import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { Schedule } from '../../../domain/models/schedule.model'
import type { ScheduleRepository } from '../../../domain/repositories/schedule.repository.interface'
// src/application/use-cases/schedule/create-schedule.use-case.ts
import { db } from '../../../infrastructure/database/db'
import { seats, trips, vehicles } from '../../../infrastructure/database/schema/schema'

// Fonction utilitaire pour générer les numéros de sièges
function generateSeatLabels(capacity: number): { seatNumber: string }[] {
  const seatsList: { seatNumber: string }[] = []
  if (capacity <= 0) return seatsList
  
  // 1A et 2A (avant, côté conducteur)
  if (capacity >= 1) seatsList.push({ seatNumber: '1A' })
  if (capacity >= 2) seatsList.push({ seatNumber: '2A' })
  if (capacity <= 2) return seatsList
  
  // Pour le reste, 4 rangées max par lettre (B, C, D, ...)
  let seatIndex = 3
  let col = 'B'.charCodeAt(0)
  while (seatIndex <= capacity) {
    for (let row = 1; row <= 4 && seatIndex <= capacity; row++) {
      seatsList.push({ seatNumber: `${row}${String.fromCharCode(col)}` })
      seatIndex++
    }
    col++
  }
  return seatsList
}

export class CreateScheduleUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(
    input: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; data?: Schedule; error?: string }> {
    try {
      // Créer le schedule
      const schedule = await this.scheduleRepository.create(input)

      // Récupérer les informations du trip et du véhicule associé
      const trip = await db
        .select({ vehicleId: trips.vehicleId })
        .from(trips)
        .where(eq(trips.id, input.tripId!))
        .then((rows) => rows[0])

      if (!trip || !trip.vehicleId) {
        return {
          success: false,
          error: 'Impossible de trouver le véhicule associé au voyage'
        }
      }

      // Récupérer la capacité du véhicule
      const vehicle = await db
        .select({ seatCount: vehicles.seatCount })
        .from(vehicles)
        .where(eq(vehicles.id, trip.vehicleId))
        .then((rows) => rows[0])

      if (!vehicle || !vehicle.seatCount) {
        return {
          success: false,
          error: 'Impossible de déterminer la capacité du véhicule'
        }
      }

      // Générer les places pour ce schedule
      const capacity = Number.parseInt(vehicle.seatCount)
      const seatLabels = generateSeatLabels(capacity)
      
      const seatsToInsert = seatLabels.map((seatLabel) => ({
        id: randomUUID(),
        vehicleId: trip.vehicleId,
        scheduleId: schedule.id,
        seatNumber: seatLabel.seatNumber,
        seatType: 'standard', // Par défaut, on peut ajuster selon les besoins
        extraFee: '0' // Par défaut
      }))

      // Insérer les places en base
      if (seatsToInsert.length > 0) {
        await db.insert(seats).values(seatsToInsert)
      }

      return { success: true, data: schedule }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erreur création schedule' }
    }
  }
}
