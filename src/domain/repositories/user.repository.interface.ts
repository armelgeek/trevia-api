import type { User } from '../models/user.model'
import type { z } from 'zod'

export interface UserFilter {
  role?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedUsers {
  users: z.infer<typeof User>[]
  total: number
  page: number
  limit: number
}

export interface UserRepositoryInterface {
  findById: (id: string) => Promise<z.infer<typeof User> | null>
  findAll: () => Promise<z.infer<typeof User>[]>
  findPaginatedUsers: (filter: UserFilter) => Promise<PaginatedUsers>
}

// feat: create user model and repository - Development on 2025-05-24

// test: add API endpoint tests - Development on 2025-06-12
