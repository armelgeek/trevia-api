import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, bookingSeats } from '../../../infrastructure/database/schema/schema'

interface GetBookingsInput {
  userId: string
  page?: string
  limit?: string
}

interface BookingData {
  bookingId: string
  tripId: string
  seatIds: string[]
  totalPrice: string
  status: string
}

interface GetBookingsOutput {
  success: boolean
  data?: BookingData[]
  page?: number
  limit?: number
  total?: number
  error?: string
}

export class GetBookingsUseCase {
  public async execute(input: GetBookingsInput): Promise<GetBookingsOutput> {
    const { userId, page = '1', limit = '20' } = input
    const pageNum = Math.max(1, Number.parseInt(page))
    const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    try {
      const allBookings = await db
        .select({
          id: bookings.id,
          tripId: bookings.tripId,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          seatId: bookingSeats.seatId
        })
        .from(bookings)
        .leftJoin(bookingSeats, eq(bookings.id, bookingSeats.bookingId))
        .where(eq(bookings.userId, userId))

      const bookingsMap = new Map()
      allBookings.forEach((booking) => {
        if (!bookingsMap.has(booking.id)) {
          const displayPrice = booking.totalPrice || '0'

          bookingsMap.set(booking.id, {
            bookingId: booking.id,
            tripId: booking.tripId,
            seatIds: [],
            totalPrice: displayPrice,
            status: booking.status ?? 'pending'
          })
        }

        if (booking.seatId) {
          bookingsMap.get(booking.id).seatIds.push(booking.seatId)
        }
      })

      const bookingsArray = Array.from(bookingsMap.values())
      const paginatedBookings = bookingsArray.slice(offset, offset + limitNum)

      return {
        success: true,
        data: paginatedBookings,
        page: pageNum,
        limit: limitNum,
        total: bookingsArray.length
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des réservations:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: implement booking validation - Development on 2025-06-01

// feat: add booking cancellation - Development on 2025-06-02
