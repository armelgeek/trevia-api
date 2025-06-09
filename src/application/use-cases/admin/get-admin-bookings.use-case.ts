import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { db } from '../../../infrastructure/database/db/index'
import { bookings } from '../../../infrastructure/database/schema/schema'

export interface GetAdminBookingsRequest {
  page: number
  limit: number
}

export interface BookingSummary {
  bookingId: string
  tripId: string
  seatIds: string[]
  totalPrice: string
  status: string
  bookedAt: string | null
}

export interface GetAdminBookingsResponse {
  data: BookingSummary[]
  page: number
  limit: number
  total: number
}

export class GetAdminBookingsUseCase extends IUseCase<GetAdminBookingsRequest, GetAdminBookingsResponse> {
  async execute(request: GetAdminBookingsRequest): Promise<GetAdminBookingsResponse> {
    const { page, limit } = request
    const offset = (page - 1) * limit

    const allBookings = await db.select().from(bookings)
    const paginated = allBookings.slice(offset, offset + limit)

    const data: BookingSummary[] = paginated.map((b) => ({
      bookingId: b.id,
      tripId: b.tripId ?? '',
      seatIds: [], // Optionnel : requête pour récupérer les sièges associés
      totalPrice: b.totalPrice ?? '0',
      status: b.status ?? 'pending',
      bookedAt: b.bookedAt ? b.bookedAt.toISOString() : null
    }))

    return {
      data,
      page,
      limit,
      total: allBookings.length
    }
  }

  log(): ActivityType {
    return ActivityType.TEST
  }
}

// feat: create admin panel functionality - Development on 2025-06-09

// feat: implement admin dashboard - Development on 2025-06-09
