import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../database/db'
import { trips } from '../database/schema/schema'
import type { TripRepository } from '../../domain/repositories/trip.repository.interface'
import type { Trip, TripFilters } from '../../domain/types/trip.type'

function toTrip(row: any): Trip {
  return {
    id: row.id,
    routeId: row.routeId,
    driverId: row.driverId,
    vehicleId: row.vehicleId,
    departureDate: row.departureDate ? new Date(row.departureDate).toISOString() : null,
    status: row.status,
    price: row.price,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : ''
  }
}

export class TripRepositoryImpl implements TripRepository {
  async create(data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    const now = new Date().toISOString()
    const id = randomUUID()
    await db
      .insert(trips)
      .values({
        // @ts-ignore
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

  async findById(id: string): Promise<Trip | null> {
    const rows = await db.select().from(trips).where(eq(trips.id, id)).execute()
    const row = rows[0]
    return row ? toTrip(row) : null
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
    const result = await db.delete(trips).where(eq(trips.id, id)).execute()
    if (typeof result === 'object' && result !== null) {
      if ('affectedRows' in result && typeof result.affectedRows === 'number') {
        return result.affectedRows > 0
      }
      if ('rowCount' in result && typeof result.rowCount === 'number') {
        return result.rowCount > 0
      }
    }
    if (Array.isArray(result)) {
      return result.length > 0
    }
    return false
  }
}
