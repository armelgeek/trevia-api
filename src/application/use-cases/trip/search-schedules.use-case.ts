import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, routes, schedules, seats, trips, vehicles } from '../../../infrastructure/database/schema/schema'

export interface SearchSchedulesInput {
  departureCity: string
  arrivalCity: string
  date: string // YYYY-MM-DD
  passengers: number
  page?: number
  limit?: number
}

export interface ScheduleSearchResult {
  scheduleId: string
  tripId: string
  departure: string
  arrival: string
  dateDeparture: string | null
  distanceKm: string
  duration: string
  price: number
  availableSeats: number
  totalSeats: number
  vehicleType: string | null
  vehicleModel: string | null
  vehicleEquipment: string[]
  routeLabel: string
}

export interface SearchSchedulesOutput {
  data: ScheduleSearchResult[]
  page: number
  limit: number
  total: number
}

export class SearchSchedulesUseCase {
  public async execute(input: SearchSchedulesInput): Promise<SearchSchedulesOutput> {
    const { departureCity, arrivalCity, date, passengers, page = 1, limit = 10 } = input

    // 1. Construction des conditions de recherche
    const conditions = this.buildSearchConditions({ departureCity, arrivalCity, date })

    // 2. Récupération des données principales
    const scheduleRows = await this.getScheduleData(conditions)

    // 3. Calcul de la disponibilité des sièges
    const seatsBySchedule = await this.calculateSeatAvailability(scheduleRows)

    // 4. Filtrage et tri des résultats
    const filteredResults = this.filterAndSortResults(scheduleRows, seatsBySchedule, passengers, { departureCity, arrivalCity, date })

    // 5. Pagination
    const total = filteredResults.length
    const paginatedResults = this.paginateResults(filteredResults, page, limit)

    // 6. Formatage des résultats
    const data = this.formatResults(paginatedResults, seatsBySchedule)

    return { data, page, limit, total }
  }

  private buildSearchConditions({ departureCity, arrivalCity, date }: Pick<SearchSchedulesInput, 'departureCity' | 'arrivalCity' | 'date'>) {
    const conditions = []

    if (departureCity) {
      conditions.push(eq(routes.departureCity, departureCity))
    }

    if (arrivalCity) {
      conditions.push(eq(routes.arrivalCity, arrivalCity))
    }

    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`)
      const endDate = new Date(`${date}T23:59:59.999Z`)
      conditions.push(
        gte(trips.departureDate, startDate),
        lte(trips.departureDate, endDate)
      )
    }

    return conditions
  }

  private async getScheduleData(conditions: any[]) {
    return await db
      .select({
        scheduleId: schedules.id,
        tripId: trips.id,
        scheduleDeparture: schedules.departureTime,
        scheduleArrival: schedules.arrivalTime,
        departureDate: trips.departureDate,
        distanceKm: routes.distanceKm,
        price: trips.price,
        routeDeparture: routes.departureCity,
        routeArrival: routes.arrivalCity,
        routeDuration: routes.duration,
        vehicleType: vehicles.type,
        vehicleModel: vehicles.model,
        vehicleEquipment: vehicles.equipment
      })
      .from(schedules)
      .leftJoin(trips, eq(schedules.tripId, trips.id))
      .leftJoin(routes, eq(trips.routeId, routes.id))
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .execute()
  }

  private async calculateSeatAvailability(scheduleRows: any[]) {
    const scheduleIds = scheduleRows.map(row => row.scheduleId).filter(Boolean)
    const seatsBySchedule: Record<string, { total: number; available: number }> = {}

    if (scheduleIds.length === 0) {
      return seatsBySchedule
    }

    // Compter le nombre total de sièges par horaire
    const totalSeatsMap = await this.getTotalSeatsPerSchedule(scheduleIds)

    // Compter le nombre de sièges réservés par horaire
    const bookedSeatsMap = await this.getBookedSeatsPerSchedule(scheduleIds)

    // Calculer la disponibilité
    for (const scheduleId of scheduleIds) {
      const totalSeats = totalSeatsMap[scheduleId] || 0
      const bookedSeats = bookedSeatsMap[scheduleId] || 0
      
      seatsBySchedule[scheduleId] = {
        total: totalSeats,
        available: totalSeats - bookedSeats
      }
    }

    return seatsBySchedule
  }

  private async getTotalSeatsPerSchedule(scheduleIds: string[]): Promise<Record<string, number>> {
    const seatsRows = await db
      .select({ scheduleId: seats.scheduleId })
      .from(seats)
      .where(inArray(seats.scheduleId, scheduleIds))
      .execute()

    const totalSeatsMap: Record<string, number> = {}
    
    for (const seat of seatsRows) {
      if (seat.scheduleId) {
        totalSeatsMap[seat.scheduleId] = (totalSeatsMap[seat.scheduleId] || 0) + 1
      }
    }

    return totalSeatsMap
  }

  private async getBookedSeatsPerSchedule(scheduleIds: string[]): Promise<Record<string, number>> {
    const bookingsRows = await db
      .select({ 
        scheduleId: bookings.scheduleId, 
        seatCount: bookings.seatCount 
      })
      .from(bookings)
      .where(inArray(bookings.scheduleId, scheduleIds))
      .execute()

    const bookedSeatsMap: Record<string, number> = {}
    
    for (const booking of bookingsRows) {
      if (booking.scheduleId) {
        const seatCount = booking.seatCount ? Number(booking.seatCount) : 0
        bookedSeatsMap[booking.scheduleId] = (bookedSeatsMap[booking.scheduleId] || 0) + seatCount
      }
    }

    return bookedSeatsMap
  }

  private filterAndSortResults(
    rows: any[], 
    seatsBySchedule: Record<string, { total: number; available: number }>, 
    passengers: number,
    { departureCity, arrivalCity, date }: Pick<SearchSchedulesInput, 'departureCity' | 'arrivalCity' | 'date'>
  ) {
    let filtered = rows

    // Filtrer par nombre de passagers
    if (typeof passengers === 'number' && passengers > 0) {
      filtered = filtered.filter(row => 
        seatsBySchedule[row.scheduleId]?.available >= passengers
      )
    }

    // Trier par date de départ si seule la date est spécifiée
    if (!departureCity && !arrivalCity && date) {
      filtered = filtered.sort((a, b) => {
        const dateA = a.departureDate ? new Date(a.departureDate).getTime() : 0
        const dateB = b.departureDate ? new Date(b.departureDate).getTime() : 0
        return dateB - dateA // Plus récent d'abord
      })
    }

    return filtered
  }

  private paginateResults(results: any[], page: number, limit: number) {
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    return results.slice(startIndex, endIndex)
  }

  private formatResults(
    rows: any[], 
    seatsBySchedule: Record<string, { total: number; available: number }>
  ): ScheduleSearchResult[] {
    return rows.map(row => ({
      scheduleId: row.scheduleId,
      tripId: row.tripId || '',
      departure: row.scheduleDeparture || '',
      arrival: row.scheduleArrival || '',
      departureCity: row.routeDeparture || null,
      arrivalCity: row.routeArrival || null,
      dateDeparture: row.departureDate ? new Date(row.departureDate).toISOString() : null,
      distanceKm: row.distanceKm || '',
      duration: row.routeDuration || '',
      price: row.price ? Number(row.price) : 0,
      availableSeats: seatsBySchedule[row.scheduleId]?.available ?? 0,
      totalSeats: seatsBySchedule[row.scheduleId]?.total ?? 0,
      vehicleType: row.vehicleType || null,
      vehicleModel: row.vehicleModel || null,
      vehicleEquipment: this.parseVehicleEquipment(row.vehicleEquipment),
      routeLabel: `${row.routeDeparture} → ${row.routeArrival}`
    }))
  }

  private parseVehicleEquipment(equipment: string | null): string[] {
    if (!equipment) return []
    
    return equipment
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }
}