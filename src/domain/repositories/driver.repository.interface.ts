import type { Driver } from '../models/driver.model'

export interface DriverRepository {
  findAll: () => Promise<Driver[]>
  findById: (id: string) => Promise<Driver | null>
  create: (driver: Omit<Driver, 'id'>) => Promise<Driver>
  update: (id: string, driver: Partial<Omit<Driver, 'id'>>) => Promise<Driver | null>
  delete: (id: string) => Promise<boolean>
}
