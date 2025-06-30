import { randomUUID } from 'node:crypto'
import { and, eq, inArray } from 'drizzle-orm'
// src/infrastructure/repositories/schedule.repository.ts
import { db } from '../database/db'
import { bookings, bookingSeats, schedules, seats, trips, vehicles } from '../database/schema/schema'
import type { ScheduleRepository } from '../../domain/repositories/schedule.repository.interface'
import type { Schedule, ScheduleFilters } from '../../domain/types/schedule.type'

function toSchedule(row: any): Schedule {
  return {
    id: row.id,
    tripId: row.tripId,
    departureTime: row.departureTime || '',
    arrivalTime: row.arrivalTime || '',
    status: row.status
  }
}

export class ScheduleRepositoryImpl implements ScheduleRepository {
  async create(data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    const [row] = await db
      .insert(schedules)
      //@ts-ignore
      // Note: 'createdAt' and 'updatedAt' are set to current date in the database
      // if you want to set them manually, you can uncomment the lines below
      .values({
        id: randomUUID(),
        tripId: data.tripId,
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        status: data.status
      })
      .returning()
    return toSchedule(row)
  }

  async findById(id: string): Promise<Schedule | null> {
    const [row] = await db.select().from(schedules).where(eq(schedules.id, id)).execute()
    return row ? toSchedule(row) : null
  }

  async findAll(filters: ScheduleFilters): Promise<{ data: Schedule[]; total: number }> {
    const whereClauses = [eq(schedules.tripId, filters.tripId)]
    // Pagination
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const offset = (page - 1) * limit
    const allRows = await db
      .select()
      .from(schedules)
      .where(and(...whereClauses))
      .execute()
    const total = allRows.length
    const dataRows = allRows.slice(offset, offset + limit)
    return { data: dataRows.map(toSchedule), total }
  }

  async update(
    id: string,
    data: Partial<Omit<Schedule, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Schedule | null> {
    const now = new Date().toISOString()
    const updateData: any = { ...data, updatedAt: now }
    await db.update(schedules).set(updateData).where(eq(schedules.id, id)).execute()
    const [row] = await db.select().from(schedules).where(eq(schedules.id, id)).execute()
    return row ? toSchedule(row) : null
  }

  async delete(id: string): Promise<boolean> {
    await db.delete(schedules).where(eq(schedules.id, id)).execute()
    return true
  }

  async getSchedulesSeats(tripId: string, scheduleId?: string, status?: string) {
    // Build base where clause
    let whereClause: any = eq(schedules.tripId, tripId)
    if (scheduleId) {
      whereClause = and(whereClause, eq(schedules.id, scheduleId!))
    }
    if (status) {
      whereClause = and(whereClause, eq(schedules.status, status!))
    }
    // Get all schedules for the trip (with optional filters)
    const schedulesRows = await db.select().from(schedules).where(whereClause).execute()

    if (!schedulesRows.length) return []

    // Get the trip to find the vehicleId (all schedules have the same tripId)
    const [tripRow] = await db.select({ vehicleId: trips.vehicleId }).from(trips).where(eq(trips.id, tripId)).execute()
    let vehicleRegistration = ''
    let vehicleCapacity = 0
    if (tripRow && tripRow.vehicleId) {
      const [vehicleRow] = await db
        .select({ registration: vehicles.registration, seatCount: vehicles.seatCount })
        .from(vehicles)
        .where(eq(vehicles.id, tripRow.vehicleId))
        .execute()
      vehicleRegistration = vehicleRow?.registration || ''
      vehicleCapacity = vehicleRow?.seatCount ? Number(vehicleRow.seatCount) : 0
    }
    const results = await Promise.all(
      schedulesRows.map(async (schedule) => {
        const bookingRows = await db
          .select({ id: bookings.id })
          .from(bookings)
          .where(and(eq(bookings.scheduleId, schedule.id), eq(bookings.status, 'confirmed')))
          .execute()
        const bookingIds = bookingRows.map((b) => b.id)

        let occupiedSeatIds: string[] = []
        if (bookingIds.length > 0) {
          const bookingSeatRows = await db
            .select({ seatId: bookingSeats.seatId })
            .from(bookingSeats)
            .where(inArray(bookingSeats.bookingId, bookingIds))
            .execute()
          occupiedSeatIds = bookingSeatRows.map((bs) => bs.seatId || '').filter((id): id is string => !!id)
        }

        const allVehicleSeats = (
          await db
            .select({ id: seats.id, seatNumber: seats.seatNumber })
            .from(seats)
            .where(eq(seats.scheduleId, schedule.id))
            .execute()
        ).map((seat) => ({ id: seat.id, seatNumber: seat.seatNumber || '' }))

        const seatsWithStatus = allVehicleSeats.map((seat) => ({
          id: seat.id,
          seatNumber: seat.seatNumber || '',
          status: occupiedSeatIds.includes(seat.id) ? 'occupied' : 'free'
        }))

        return {
          scheduleId: schedule.id,
          departureTime: schedule.departureTime || '',
          arrivalTime: schedule.arrivalTime || '',
          vehicleRegistration,
          vehicleCapacity,
          seats: seatsWithStatus
        }
      })
    )
    return results
  }
}
