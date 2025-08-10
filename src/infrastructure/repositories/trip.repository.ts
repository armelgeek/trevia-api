import { randomUUID } from 'node:crypto'
import { and, count, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { bookings, bookingSeats, drivers, routes, schedules, seats, trips, vehicles } from '../database/schema/schema'
import type { TripRepository } from '../../domain/repositories/trip.repository.interface'
import type { Trip, TripFilters } from '../../domain/types/trip.type'

function toTrip(row: any): Trip {
  return {
    id: row.id,
    routeId: row.routeId,
    driverId: row.driverId,
    vehicleId: row.vehicleId,
    departureDate: row.departureDate ? row.departureDate : null,
    status: row.status,
    price: row.price,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : ''
  }
}

export class TripRepositoryImpl implements TripRepository {
  async create(data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    const now = new Date()
    const id = randomUUID()
    await db
      .insert(trips)
      .values({
        id: randomUUID(),
        routeId: data.routeId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        departureDate: data.departureDate ? new Date(data.departureDate) : null,
        status: data.status,
        price: data.price,
        createdAt: now,
        updatedAt: now
      })
      .execute()
    const rows = await db.select().from(trips).where(eq(trips.id, id)).execute()
    const row = rows[0]
    return toTrip({ ...data, ...row, id, createdAt: now, updatedAt: now })
  }

  async findById(id: string): Promise<any | null> {
    const rows = await db
      .select({
        tripId: trips.id,
        departureDate: trips.departureDate,
        price: trips.price,
        duration: routes.duration,
        vehicle: vehicles.model,
        from: routes.departureCity,
        to: routes.arrivalCity
      })
      .from(trips)
      .leftJoin(routes, eq(routes.id, trips.routeId))
      .leftJoin(vehicles, eq(vehicles.id, trips.vehicleId))
      .where(eq(trips.id, id))
      .execute()
    const tripData = rows[0]
    if (!tripData) return null
    return {
      tripId: tripData.tripId,
      from: tripData.from || '',
      to: tripData.to || '',
      date: tripData.departureDate ? new Date(tripData.departureDate).toLocaleDateString() : '',
      time: tripData.departureDate
        ? new Date(tripData.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      duration: tripData.duration || '',
      pricePerSeat: tripData.price || 0,
      vehicle: tripData.vehicle || ''
    }
  }

  async findAll(filters?: TripFilters): Promise<{ data: Trip[]; total: number }> {
    let query = db.select().from(trips)
    const whereClauses = []
    if (filters) {
      if (filters.routeId) whereClauses.push(eq(trips.routeId, filters.routeId))
      if (filters.driverId) whereClauses.push(eq(trips.driverId, filters.driverId))
      if (filters.vehicleId) whereClauses.push(eq(trips.vehicleId, filters.vehicleId))
      if (filters.status) whereClauses.push(eq(trips.status, filters.status))
      // TODO: gérer dateStart/dateEnd si besoin
    }
    if (whereClauses.length > 0) {
      // @ts-ignore
      query = query.where(and(...whereClauses))
    }
    // Total count
    const totalRows = await query.execute()
    const total = totalRows.length
    // Pagination
    let dataRows = totalRows
    if (filters?.page && filters?.limit) {
      const start = (filters.page - 1) * filters.limit
      dataRows = totalRows.slice(start, start + filters.limit)
    }
    return { data: dataRows.map(toTrip), total }
  }

  async update(id: string, data: Partial<Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Trip | null> {
    const now = new Date().toISOString()
    // Convert date fields if present
    const updateData: any = { ...data }
    if ('departureDate' in updateData && updateData.departureDate !== undefined) {
      updateData.departureDate = updateData.departureDate ? new Date(updateData.departureDate) : null
    }
    updateData.updatedAt = now
    await db.update(trips).set(updateData).where(eq(trips.id, id)).execute()
    const rows = await db.select().from(trips).where(eq(trips.id, id)).execute()
    const row = rows[0]
    return row ? toTrip(row) : null
  }

  async delete(id: string): Promise<boolean> {
    // Transaction pour supprimer en cascade
    try {
      await db.transaction(async (tx) => {
        // 1. Récupérer tous les schedules de ce trip
        const tripSchedules = await tx.select({ id: schedules.id }).from(schedules).where(eq(schedules.tripId, id))
        
        const scheduleIds = tripSchedules.map((s) => s.id)
        
        if (scheduleIds.length > 0) {
          // 2. Récupérer tous les sièges des schedules
          const scheduleSeats = await tx
            .select({ id: seats.id })
            .from(seats)
            .where(inArray(seats.scheduleId, scheduleIds))
          
          const seatIds = scheduleSeats.map((s) => s.id)
          
          // 3. Supprimer les booking_seats liés aux sièges
          if (seatIds.length > 0) {
            await tx.delete(bookingSeats).where(inArray(bookingSeats.seatId, seatIds))
          }
          
          // 4. Supprimer les sièges des schedules
          await tx.delete(seats).where(inArray(seats.scheduleId, scheduleIds))
        }
        
        // 5. Supprimer les bookings de ce trip
        await tx.delete(bookings).where(eq(bookings.tripId, id))
        
        // 6. Supprimer les schedules de ce trip
        await tx.delete(schedules).where(eq(schedules.tripId, id))
        
        // 7. Enfin, supprimer le trip
        await tx.delete(trips).where(eq(trips.id, id))
      })
      
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du voyage:', error)
      return false
    }
  }

  async findByPopularity(page = 1, limit = 20) {
    const offset = (page - 1) * limit
    // Récupérer les voyages avec le nombre de réservations, prix, horaires, durée, etc.
    const rows = await db
      .select({
        tripId: trips.id,
        departureDate: trips.departureDate,
        price: trips.price,
        routeDeparture: routes.departureCity,
        routeArrival: routes.arrivalCity,
        driverFirstName: drivers.firstName,
        driverLastName: drivers.lastName,
        vehicleModel: vehicles.model,
        bookingsCount: count(bookings.id).as('bookingsCount'),
        duration: routes.duration
      })
      .from(trips)
      .leftJoin(bookings, eq(bookings.tripId, trips.id))
      .leftJoin(routes, eq(routes.id, trips.routeId))
      .leftJoin(drivers, eq(drivers.id, trips.driverId))
      .leftJoin(vehicles, eq(vehicles.id, trips.vehicleId))
      .groupBy(
        trips.id,
        routes.departureCity,
        routes.arrivalCity,
        drivers.firstName,
        drivers.lastName,
        vehicles.model,
        routes.duration,
        trips.departureDate,
        trips.price
      )
      .orderBy(desc(count(bookings.id)))
      .limit(limit)
      .offset(offset)
      .execute()

    // Récupérer les horaires disponibles pour chaque trip
    const tripIds = rows.map((r) => r.tripId)
    let availableTimesMap: Record<string, string[]> = {}
    if (tripIds.length > 0) {
      const schedulesRows = await db
        .select({ tripId: schedules.tripId, departureTime: schedules.departureTime })
        .from(schedules)
        .where(inArray(schedules.tripId, tripIds))
        .execute()
      availableTimesMap = schedulesRows.reduce(
        (acc, s) => {
          if (!acc[s.tripId]) acc[s.tripId] = []
          if (s.departureTime) acc[s.tripId].push(s.departureTime)
          return acc
        },
        {} as Record<string, string[]>
      )
    }

    const data = rows.map((row) => ({
      tripId: row.tripId,
      routeLabel: [row.routeDeparture, row.routeArrival].filter(Boolean).join(' - '),
      departureDate: row.departureDate ? new Date(row.departureDate).toISOString() : null,
      bookingsCount: Number(row.bookingsCount),
      price: row.price ? Number(row.price) : null,
      availableTimes: availableTimesMap[row.tripId] || [],
      duration: row.duration ? Number(row.duration) : null,
      driverName: row.driverFirstName && row.driverLastName ? `${row.driverFirstName} ${row.driverLastName}` : null,
      vehicleModel: row.vehicleModel || null,
      departureCity: row.routeDeparture || null,
      arrivalCity: row.routeArrival || null
    }))

    // Total
    const totalRows = await db.select({ tripId: trips.id }).from(trips).execute()
    const total = totalRows.length

    return { data, page, limit, total }
  }
}
