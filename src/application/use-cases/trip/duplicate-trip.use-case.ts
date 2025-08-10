import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db'
import { schedules, seats, trips } from '../../../infrastructure/database/schema/schema'

interface DuplicateTripInput {
  tripId: string
  newDepartureDate?: string // Si fourni, utilise cette date, sinon incrémente d'un jour
  dayIncrement?: number // Nombre de jours à ajouter (défaut: 1)
  includeSchedules?: boolean // Si true, duplique aussi les schedules (défaut: true)
}

interface DuplicateTripOutput {
  success: boolean
  data?: {
    originalTripId: string
    newTripId: string
    newDepartureDate: string
    schedulesCount: number
    seatsCount: number
  }
  error?: string
}

export class DuplicateTripUseCase {
  public async execute(input: DuplicateTripInput): Promise<DuplicateTripOutput> {
    const { tripId, newDepartureDate, dayIncrement = 1, includeSchedules = true } = input

    try {
      // Récupérer le voyage original
      const originalTrip = await db
        .select()
        .from(trips)
        .where(eq(trips.id, tripId))
        .then((rows) => rows[0])

      if (!originalTrip) {
        return { success: false, error: 'Voyage non trouvé' }
      }

      // Calculer la nouvelle date de départ
      let calculatedDate: string
      if (newDepartureDate) {
        calculatedDate = newDepartureDate
      } else if (originalTrip.departureDate) {
        const originalDate = new Date(originalTrip.departureDate)
        originalDate.setDate(originalDate.getDate() + dayIncrement)
        calculatedDate = originalDate.toISOString()
      } else {
        const today = new Date()
        today.setDate(today.getDate() + dayIncrement)
        calculatedDate = today.toISOString()
      }

      // Créer le nouveau voyage
      const newTripId = randomUUID()
      await db
        .insert(trips)
        .values({
          id: newTripId,
          routeId: originalTrip.routeId,
          vehicleId: originalTrip.vehicleId,
          driverId: originalTrip.driverId,
          departureDate: new Date(calculatedDate),
          status: 'scheduled', // Nouveau voyage toujours en statut scheduled
          price: originalTrip.price
        })
        .returning()

      // Récupérer tous les schedules du voyage original
      const originalSchedules = await db.select().from(schedules).where(eq(schedules.tripId, tripId))

      let schedulesCount = 0
      let seatsCount = 0

      // Dupliquer chaque schedule seulement si includeSchedules est true
      if (includeSchedules) {
        for (const originalSchedule of originalSchedules) {
          const newScheduleId = randomUUID()
          
          // Créer le nouveau schedule
          await db.insert(schedules).values({
            id: newScheduleId,
            tripId: newTripId,
            departureTime: originalSchedule.departureTime,
            arrivalTime: originalSchedule.arrivalTime,
            status: 'scheduled'
          })
          schedulesCount++

          // Récupérer et dupliquer les sièges du schedule original
          const originalSeats = await db.select().from(seats).where(eq(seats.scheduleId, originalSchedule.id))

          if (originalSeats.length > 0) {
            const newSeats = originalSeats.map((seat) => ({
              id: randomUUID(),
              vehicleId: seat.vehicleId,
              scheduleId: newScheduleId,
              seatNumber: seat.seatNumber,
              seatType: seat.seatType,
              row: seat.row,
              col: seat.col,
              extraFee: seat.extraFee
            }))

            await db.insert(seats).values(newSeats)
            seatsCount += newSeats.length
          }
        }
      }

      return {
        success: true,
        data: {
          originalTripId: tripId,
          newTripId,
          newDepartureDate: calculatedDate,
          schedulesCount,
          seatsCount
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la duplication du voyage:', error)
      return {
        success: false,
        error: error.message || 'Erreur lors de la duplication du voyage'
      }
    }
  }
}
