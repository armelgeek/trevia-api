import { and, eq } from 'drizzle-orm'
// src/infrastructure/repositories/schedule.repository.ts
import { db } from '../database/db'
import { schedules } from '../database/schema/schema'
import type { ScheduleRepository } from '../../domain/repositories/schedule.repository.interface'
import type { Schedule, ScheduleFilters } from '../../domain/types/schedule.type'

function toSchedule(row: any): Schedule {
  return {
    id: row.id,
    tripId: row.tripId,
    departureTime: row.departureTime ? new Date(row.departureTime).toISOString() : '',
    arrivalTime: row.arrivalTime ? new Date(row.arrivalTime).toISOString() : '',
    status: row.status,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : ''
  }
}

export class ScheduleRepositoryImpl implements ScheduleRepository {
  async create(data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    const now = new Date().toISOString()
    const [row] = await db
      .insert(schedules)
      .values({
        // @ts-ignore
        tripId: data.tripId,
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        status: data.status,
        createdAt: now,
        updatedAt: now
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
}
