import { desc, eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import {
  bookings,
  bookingSeats,
  drivers,
  routes,
  schedules,
  seats,
  trips,
  vehicles
} from '../../../infrastructure/database/schema/schema'

interface GetTripsInput {
  page?: string
  limit?: string
  sort?: string
  filter?: string
  departureCity?: string
  arrivalCity?: string
  date?: string
  passengers?: string
  scheduleType?: string
  classType?: string
}

interface TripData {
  id: string
  routeId: string
  routeName?: string | null
  vehicleId: string
  vehicleName?: string | null
  driverId: string
  driverName?: string | null
  departureDate: string | null
  status: string | null
  price: string | null
  departureCity?: string | null
  arrivalCity?: string | null
  availableSchedules?: any[]
}

interface GetTripsOutput {
  success: boolean
  data?: TripData[]
  page?: number
  limit?: number
  total?: number
  error?: string
}

export class GetTripsUseCase {
  public async execute(input: GetTripsInput): Promise<GetTripsOutput> {
    const { page = '1', limit = '20', departureCity, arrivalCity, date, passengers, scheduleType, classType } = input

    const pageNum = Math.max(1, Number.parseInt(page))
    const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    try {
      let data = await db.select().from(trips).orderBy(desc(trips.departureDate))
      const allRoutes = await db.select().from(routes)
      const allSchedules = await db.select().from(schedules)

      data = data.filter((trip) => {
        const route = allRoutes.find((r) => r.id === trip.routeId)
        const schedule = allSchedules.find((s) => s.tripId === trip.id)

        if (departureCity && route?.departureCity?.toLowerCase() !== departureCity.toLowerCase()) return false
        if (arrivalCity && route?.arrivalCity?.toLowerCase() !== arrivalCity.toLowerCase()) return false
        if (date && trip.departureDate) {
          const tripDate = new Date(trip.departureDate).toISOString().slice(0, 10)
          if (tripDate !== date) return false
        }
        if (scheduleType && schedule?.departureTime) {
          const hour = schedule.departureTime.getHours()
          if (scheduleType === 'Matin' && (hour < 6 || hour >= 12)) return false
          if (scheduleType === 'Après-midi' && (hour < 12 || hour >= 18)) return false
          if (scheduleType === 'Soir' && (hour < 18 || hour >= 24)) return false
        }
        if (classType && trip.status?.toLowerCase() !== classType.toLowerCase()) return false

        return true
      })

      if (passengers) {
        const nb = Number.parseInt(passengers)
        const tripResults = await Promise.all(
          data.map(async (trip) => {
            if (!trip.vehicleId) return null
            const seatsList = await db.select().from(seats).where(eq(seats.vehicleId, trip.vehicleId))
            const bookedSeats = await db
              .select({ seatId: bookingSeats.seatId })
              .from(bookingSeats)
              .leftJoin(bookings, eq(bookingSeats.bookingId, bookings.id))
              .where(eq(bookings.tripId, trip.id))
            const occupiedSeatIds = bookedSeats.map((bs) => bs.seatId)
            const freeSeats = seatsList.filter((seat) => !occupiedSeatIds.includes(seat.id))
            return freeSeats.length >= nb ? trip : null
          })
        )
        data = tripResults.filter(Boolean) as typeof data
      }

      const allDrivers = await db.select().from(drivers)
      const allVehicles = await db.select().from(vehicles)

      const enrichedData = data.map((trip) => {
        const availableSchedules = allSchedules.filter((s) => s.tripId === trip.id)
        const route = allRoutes.find((r) => r.id === trip.routeId)
        const vehicle = allVehicles?.find((v) => v.id === trip.vehicleId) || null
        const driver = allDrivers?.find((d) => d.id === trip.driverId) || null
        return {
          ...trip,
          availableSchedules,
          departureCity: route?.departureCity || null,
          arrivalCity: route?.arrivalCity || null,
          routeName: route ? `${route.departureCity} - ${route.arrivalCity}` : null,
          vehicleName: vehicle ? vehicle.model : null,
          driverName: driver ? `${driver.firstName} ${driver.lastName}` : null
        }
      })

      const paginatedData = enrichedData.slice(offset, offset + limitNum)

      return {
        success: true,
        data: paginatedData as any,
        page: pageNum,
        limit: limitNum,
        total: enrichedData.length
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des voyages:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create trip controller - Development on 2025-05-31

// feat: implement health checks - Development on 2025-06-17
