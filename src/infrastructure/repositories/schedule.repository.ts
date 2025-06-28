import { and, eq } from 'drizzle-orm'
// src/infrastructure/repositories/schedule.repository.ts
import { db } from '../database/db'
import { schedules } from '../database/schema/schema'
import type { ScheduleRepository } from '../../domain/repositories/schedule.repository.interface'
import type { Schedule, ScheduleFilters } from '../../domain/types/schedule.type'
import { randomUUID } from 'node:crypto'

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
}
