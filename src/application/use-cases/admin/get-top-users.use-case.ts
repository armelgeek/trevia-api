import { db } from '../../../infrastructure/database/db/index'
import { bookings, users } from '../../../infrastructure/database/schema/schema'

export class GetTopUsersUseCase {
  async execute(limit = 10) {
    const bookingsAll = await db.select().from(bookings)
    const allUsers = await db.select().from(users)
    const userBookingCount: Record<string, number> = {}
    bookingsAll.forEach((b) => {
      if (b.userId) {
        userBookingCount[b.userId] = (userBookingCount[b.userId] || 0) + 1
      }
    })
    const topUsers = Object.entries(userBookingCount)
      .map(([userId, bookings]) => {
        const user = allUsers.find((u) => u.id === userId)
        return {
          userId,
          userName: user ? user.name || user.email || user.id : userId,
          bookings
        }
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, limit)
    return { topUsers }
  }
}
