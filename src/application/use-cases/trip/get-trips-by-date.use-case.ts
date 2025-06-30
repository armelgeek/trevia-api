import { db } from '../../../infrastructure/database/db/index'
import { trips, routes, schedules, vehicles, seats, bookings } from '../../../infrastructure/database/schema/schema'
import { eq, and, gte, lte, inArray } from 'drizzle-orm'

export interface GetTripsByDateInput {
  date: string // format YYYY-MM-DD
}

export interface Schedule {
  id: string
  departure: string
  arrival: string
  duration: string
  price: number
  availableSeats: number
  totalSeats: number
  vehicleType: string | null
  stops: string[]
}

export interface DestinationSchedules {
  label: string
  schedules: Schedule[]
}

export class GetTripsByDateUseCase {
  public async execute(input: GetTripsByDateInput): Promise<DestinationSchedules[]> {
    const { date } = input
    // On veut les schedules dont la date de départ correspond à la date donnée (YYYY-MM-DD)
    // On joint trips, routes, vehicles, schedules
    // Pour chaque schedule, on calcule les places disponibles
    // On regroupe par label (ex: Paris → Lyon)

    // 1. Récupérer tous les schedules pour la date donnée
    const startDate = new Date(`${date}T00:00:00.000Z`)
    const endDate = new Date(`${date}T23:59:59.999Z`)

    const rows = await db
      .select({
        scheduleId: schedules.id,
        scheduleDeparture: schedules.departureTime,
        scheduleArrival: schedules.arrivalTime,
        tripId: trips.id,
        tripDepartureDate: trips.departureDate,
        price: trips.price,
        routeDeparture: routes.departureCity,
        routeArrival: routes.arrivalCity,
        routeDuration: routes.duration,
        vehicleType: vehicles.type,
        vehicleId: vehicles.id,
        vehicleModel: vehicles.model
      })
      .from(schedules)
      .leftJoin(trips, eq(schedules.tripId, trips.id))
      .leftJoin(routes, eq(trips.routeId, routes.id))
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .where(and(
        gte(trips.departureDate, startDate),
        lte(trips.departureDate, endDate)
      ))
      .execute()

    const scheduleIds = rows.map((r) => r.scheduleId).filter(Boolean)
    const seatsBySchedule: Record<string, { total: number; available: number }> = {}
    if (scheduleIds.length > 0) {
      // Total seats par schedule
      const seatsRows = await db
        .select({ scheduleId: seats.scheduleId })
        .from(seats)
        .where(inArray(seats.scheduleId, scheduleIds))
        .execute()
      const totalSeatsMap: Record<string, number> = {}
      for (const s of seatsRows) {
        if (s.scheduleId) totalSeatsMap[s.scheduleId] = (totalSeatsMap[s.scheduleId] || 0) + 1
      }
      // Booked seats par schedule
      const bookingsRows = await db
        .select({ scheduleId: bookings.scheduleId, seatCount: bookings.seatCount })
        .from(bookings)
        .where(inArray(bookings.scheduleId, scheduleIds))
        .execute()
      const bookedSeatsMap: Record<string, number> = {}
      for (const b of bookingsRows) {
        if (b.scheduleId) bookedSeatsMap[b.scheduleId] = (bookedSeatsMap[b.scheduleId] || 0) + (b.seatCount ? Number(b.seatCount) : 0)
      }
      // Fusion
      for (const id of scheduleIds) {
        seatsBySchedule[id] = {
          total: totalSeatsMap[id] || 0,
          available: (totalSeatsMap[id] || 0) - (bookedSeatsMap[id] || 0)
        }
      }
    }

    // 3. Regrouper par destination (label)
    const destinationsMap: Record<string, DestinationSchedules> = {}
    for (const row of rows) {
      const label = `${row.routeDeparture} → ${row.routeArrival}`
      if (!destinationsMap[label]) {
        destinationsMap[label] = { label, schedules: [] }
      }
      destinationsMap[label].schedules.push({
        id: row.scheduleId,
        departure: row.scheduleDeparture || '',
        arrival: row.scheduleArrival || '',
        duration: row.routeDuration || '',
        price: row.price ? Number(row.price) : 0,
        availableSeats: seatsBySchedule[row.scheduleId]?.available ?? 0,
        totalSeats: seatsBySchedule[row.scheduleId]?.total ?? 0,
        vehicleType: row.vehicleType || null,
        stops: [] // TODO: ajouter les arrêts si disponibles dans la base
      })
    }
    return Object.values(destinationsMap)
  }
}
