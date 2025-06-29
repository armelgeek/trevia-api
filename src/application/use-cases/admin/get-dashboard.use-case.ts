import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { db } from '../../../infrastructure/database/db/index'
import {
  bookings,
  bookingSeats,
  routes,
  schedules,
  seats,
  trips,
  users,
  vehicles
} from '../../../infrastructure/database/schema/schema'
import { GetRecentBookingsUseCase } from './get-recent-bookings.use-case'
import { GetTopDestinationsUseCase } from './get-top-destinations.use-case'
import { GetUpcomingDeparturesUseCase } from './get-upcoming-departures.use-case'

export interface GetDashboardRequest {}

export interface GetDashboardResponse {
  totalBookings: number
  totalTrips: number
  totalUsers?: number
  alerts: string[]
  upcomingTrips?: {
    today: number
    week: number
    month: number
  }
  averageOccupancyRate?: number
  totalActiveVehicles?: number
  bookingTrends?: Array<{ date: string; count: number }>
  occupancyByRoute?: Array<{ routeId: string; label: string; occupancy: number }>
  occupancyByVehicle?: Array<{ vehicleId: string; label: string; occupancy: number }>
  occupancyBySchedule?: Array<{
    scheduleId: string
    tripId: string
    routeId: string
    label: string
    departureTime: string
    occupancy: number
  }>
  upcomingDepartures?: Array<{
    scheduleId: string
    tripId: string
    routeLabel: string
    departureTime: string
    occupancy: number
    status: string
  }>
  recentBookings?: Array<{
    bookingId: string
    userName: string
    tripId: string
    routeLabel: string
    bookedAt: string
    status: string
  }>
  topDestinations?: Array<{ routeId: string; routeLabel: string; bookings: number }>
}

export class GetDashboardUseCase extends IUseCase<GetDashboardRequest, GetDashboardResponse> {
  async execute(): Promise<GetDashboardResponse> {
    const totalBookings = (await db.select().from(bookings)).length
    const totalTrips = (await db.select().from(trips)).length

    const alerts: string[] = []

    if (totalBookings === 0) {
      alerts.push('Aucune réservation enregistrée.')
    }

    if (totalTrips === 0) {
      alerts.push('Aucun voyage planifié.')
    }

    // Calcul des voyages à venir
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // On considère les voyages à venir comme ceux dont departureDate >= aujourd'hui
    const allTrips = await db.select().from(trips)
    const upcomingToday = allTrips.filter(
      (trip) => trip.departureDate && trip.departureDate >= todayStart && trip.departureDate < todayEnd
    ).length
    const upcomingWeek = allTrips.filter(
      (trip) => trip.departureDate && trip.departureDate >= weekStart && trip.departureDate < weekEnd
    ).length
    const upcomingMonth = allTrips.filter(
      (trip) => trip.departureDate && trip.departureDate >= monthStart && trip.departureDate < monthEnd
    ).length

    // Nombre d’utilisateurs inscrits
    const totalUsers = (await db.select().from(users)).length
    // Nombre de véhicules actifs (status === 'active')
    const totalActiveVehicles = (await db.select().from(vehicles)).filter((v) => v.status === 'active').length
    // Taux d’occupation moyen (places réservées / places totales)
    // On considère les bookings confirmés
    const confirmedBookings = (await db.select().from(bookings)).filter((b) => b.status === 'confirmed')
    const bookedSeatIds = (await db.select().from(bookingSeats))
      .filter((bs) => confirmedBookings.some((b) => b.id === bs.bookingId))
      .map((bs) => bs.seatId)
    const totalReservedSeats = bookedSeatIds.length
    const totalSeats = (await db.select().from(seats)).length
    const averageOccupancyRate = totalSeats > 0 ? Math.round((totalReservedSeats / totalSeats) * 100) : 0

    // Courbe des réservations (par jour sur 30 jours)
    const bookingsAll = await db.select().from(bookings)
    const trends: Record<string, number> = {}
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      trends[key] = 0
    }
    bookingsAll.forEach((b) => {
      if (b.bookedAt) {
        const key = new Date(b.bookedAt).toISOString().slice(0, 10)
        if (trends[key] !== undefined) trends[key]++
      }
    })
    const bookingTrends = Object.entries(trends).map(([date, count]) => ({ date, count }))

    // Filtrer les trips à venir (departureDate >= aujourd'hui, status !== 'cancelled')
    const nowDate = new Date()
    const upcomingTripsList = allTrips.filter(
      (trip) => trip.departureDate && trip.departureDate >= nowDate && trip.status !== 'cancelled'
    )
    // Récupérer tous les schedules associés à ces trips
    const allSchedules = await db.select().from(schedules)
    // Récupérer tous les seats et bookingSeats une seule fois
    const allSeats = await db.select().from(seats)
    const allBookingSeats = await db.select().from(bookingSeats)
    // Récupérer toutes les routes (pour mapping par ligne)
    const allRoutes = await db.select().from(routes)
    // Taux d’occupation par ligne (route)
    const occupancyByRoute = allRoutes.map((route: any) => {
      const tripsForRoute = upcomingTripsList.filter((t) => t.routeId === route.id)
      const tripIds = tripsForRoute.map((t) => t.id).filter((id): id is string => !!id)
      const schedulesForRoute = allSchedules.filter((s) => s.tripId && tripIds.includes(s.tripId))
      const scheduleIds = schedulesForRoute.map((s) => s.id).filter((id): id is string => !!id)
      const seatsForRoute = allSeats.filter((s) => s.scheduleId && scheduleIds.includes(s.scheduleId))
      const totalSeatsRoute = seatsForRoute.length
      const bookingsForRoute = confirmedBookings.filter((b) => b.tripId && tripIds.includes(b.tripId))
      const bookingSeatIds = allBookingSeats
        .filter((bs) => bookingsForRoute.some((b) => b.id === bs.bookingId))
        .map((bs) => bs.seatId)
      const reservedSeatsRoute = bookingSeatIds.length
      const occupancy = totalSeatsRoute > 0 ? Math.round((reservedSeatsRoute / totalSeatsRoute) * 100) : 0
      return {
        routeId: route.id,
        label: `${route.departureCity} - ${route.arrivalCity}`,
        occupancy
      }
    })
    // Taux d’occupation par véhicule
    const allVehicles = await db.select().from(vehicles)
    const occupancyByVehicle = allVehicles.map((vehicle) => {
      // Trips à venir pour ce véhicule
      const tripsForVehicle = upcomingTripsList.filter((t) => t.vehicleId === vehicle.id)
      const tripIds = tripsForVehicle.map((t) => t.id).filter((id): id is string => !!id)
      // Schedules liés à ces trips
      const schedulesForVehicle = allSchedules.filter((s) => s.tripId && tripIds.includes(s.tripId))
      const scheduleIds = schedulesForVehicle.map((s) => s.id).filter((id): id is string => !!id)
      // Seats liés à ces schedules
      const seatsForVehicle = allSeats.filter((s) => s.scheduleId && scheduleIds.includes(s.scheduleId))
      const totalSeatsVehicle = seatsForVehicle.length
      // Bookings confirmés pour ces trips
      const bookingsForVehicle = confirmedBookings.filter((b) => b.tripId && tripIds.includes(b.tripId))
      // BookingSeats pour ces bookings
      const bookingSeatIds = allBookingSeats
        .filter((bs) => bookingsForVehicle.some((b) => b.id === bs.bookingId))
        .map((bs) => bs.seatId)
      const reservedSeatsVehicle = bookingSeatIds.length
      const occupancy = totalSeatsVehicle > 0 ? Math.round((reservedSeatsVehicle / totalSeatsVehicle) * 100) : 0
      return {
        vehicleId: vehicle.id,
        label: vehicle.registration || vehicle.model || vehicle.id,
        occupancy
      }
    })
    // Définir la période de la semaine en cours
    const weekStartDate = new Date(now)
    weekStartDate.setDate(now.getDate() - now.getDay())
    weekStartDate.setHours(0, 0, 0, 0)
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 7)
    // Taux d’occupation par schedule (horaire) uniquement pour les voyages de la semaine
    const occupancyBySchedule = allSchedules
      .filter((s) => {
        // On ne garde que les schedules liés à un trip à venir cette semaine
        const trip = upcomingTripsList.find((t) => t.id === s.tripId)
        return !!trip && trip.departureDate && trip.departureDate >= weekStartDate && trip.departureDate < weekEndDate
      })
      .map((schedule) => {
        const trip = upcomingTripsList.find((t) => t.id === schedule.tripId)
        if (!trip) return null
        const route = allRoutes.find((r) => r.id === trip.routeId)
        const seatsForSchedule = allSeats.filter((seat) => seat.scheduleId === schedule.id)
        const totalSeatsSchedule = seatsForSchedule.length
        // Bookings confirmés pour ce trip
        const bookingsForSchedule = confirmedBookings.filter((b) => b.tripId === trip.id)
        // BookingSeats pour ces bookings
        const bookingSeatIds = allBookingSeats
          .filter((bs) => bookingsForSchedule.some((b) => b.id === bs.bookingId))
          .map((bs) => bs.seatId)
        const reservedSeatsSchedule = seatsForSchedule.filter((seat) => bookingSeatIds.includes(seat.id)).length
        const occupancy = totalSeatsSchedule > 0 ? Math.round((reservedSeatsSchedule / totalSeatsSchedule) * 100) : 0
        return {
          scheduleId: schedule.id,
          tripId: trip.id,
          routeId: route?.id || '',
          label: `${route?.departureCity || ''} - ${route?.arrivalCity || ''}`,
          departureTime: schedule.departureTime || '',
          occupancy
        }
      })
      .filter(
        (
          s
        ): s is {
          scheduleId: string
          tripId: string
          routeId: string
          label: string
          departureTime: string
          occupancy: number
        } => s !== null
      )

    // --- Upcoming departures (prochains départs) ---
    const upcomingDepartures = (await new GetUpcomingDeparturesUseCase().execute(20)).upcomingDepartures

    // --- Réservations récentes ---
    const recentBookings = (await new GetRecentBookingsUseCase().execute(10)).recentBookings

    // --- Top destinations ---
    const topDestinations = (await new GetTopDestinationsUseCase().execute(5)).topDestinations

    return {
      totalBookings,
        totalTrips,
        totalUsers,
        alerts,
        upcomingTrips: {
          today: upcomingToday,
          week: upcomingWeek,
          month: upcomingMonth
        },
        averageOccupancyRate,
        totalActiveVehicles,
        bookingTrends,
        occupancyByRoute,
        occupancyByVehicle,
        occupancyBySchedule,
        upcomingDepartures,
        recentBookings,
        topDestinations
    }
  }

  log(): ActivityType {
    return ActivityType.TEST
  }
}

// feat: add admin user management - Development on 2025-06-09

// feat: add admin analytics - Development on 2025-06-10
