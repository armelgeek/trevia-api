import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { drivers } from '../database/schema/schema'
import type { Driver } from '../../domain/models/driver.model'
import type { DriverRepository } from '../../domain/repositories/driver.repository.interface'

export class DriverRepositoryImpl implements DriverRepository {
  async findAll(): Promise<Driver[]> {
    const res = await db.select().from(drivers)
    // Ajoute fullName à la volée (non stocké en base)
    return res.map((d) => ({ ...d, fullName: `${d.firstName} ${d.lastName}` }))
  }

  async findById(id: string): Promise<Driver | null> {
    const res = await db.select().from(drivers).where(eq(drivers.id, id))
    if (!res[0]) return null
    return { ...res[0], fullName: `${res[0].firstName} ${res[0].lastName}` }
  }

  async create(driver: Omit<Driver, 'id' | 'fullName'>): Promise<Driver> {
    const newDriver = { ...driver, id: randomUUID() }
    await db.insert(drivers).values(newDriver)
    return { ...newDriver, fullName: `${newDriver.firstName} ${newDriver.lastName}` }
  }

  async update(id: string, driver: Partial<Omit<Driver, 'id' | 'fullName'>>): Promise<Driver | null> {
    await db.update(drivers).set(driver).where(eq(drivers.id, id))
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    await db.delete(drivers).where(eq(drivers.id, id))
    return true
  }
}
