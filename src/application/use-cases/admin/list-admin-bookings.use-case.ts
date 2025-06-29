import { IUseCase } from '@/domain/types/use-case.type'
import { db } from '@/infrastructure/database/db/index'
import { bookings, routes, trips, users } from '@/infrastructure/database/schema/schema'
import { ActivityType } from '@/infrastructure/config/activity.config'

export interface ListAdminBookingsRequest {
  page?: number
  limit?: number
}

export interface ListAdminBookingsResponse {
  bookings: Array<{
    bookingId: string
    userName: string
    tripId: string
    routeLabel: string
    bookedAt: string
    status: string
  }>
  total: number
  page: number
  limit: number
}

export class ListAdminBookingsUseCase extends IUseCase<ListAdminBookingsRequest, ListAdminBookingsResponse> {
  async execute({ page = 1, limit = 20 }: ListAdminBookingsRequest = {}): Promise<ListAdminBookingsResponse> {
    const allBookings = await db.select().from(bookings)
    const allUsers = await db.select().from(users)
    const allTrips = await db.select().from(trips)
    const allRoutes = await db.select().from(routes)
    const start = (page - 1) * limit
    const end = start + limit
    const paginated = allBookings.slice(start, end)
    const bookingsList = paginated.map((b) => {
      const user = allUsers.find((u) => u.id === b.userId)
      const trip = allTrips.find((t) => t.id === b.tripId)
      const route = allRoutes.find((r) => r.id === trip?.routeId)
      return {
        bookingId: b.id,
        userName: user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : '',
        tripId: b.tripId || '',
        routeLabel: route ? `${route.departureCity} - ${route.arrivalCity}` : '',
        bookedAt: b.bookedAt ? (typeof b.bookedAt === 'string' ? b.bookedAt : b.bookedAt.toISOString()) : '',
        status: b.status || ''
      }
    })
    return {
      bookings: bookingsList,
      total: allBookings.length,
      page,
      limit
    }
  }
  log(): ActivityType {
    return ActivityType.TEST
  }
}
