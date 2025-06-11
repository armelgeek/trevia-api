import { randomUUID } from 'node:crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { stripe } from '../../../infrastructure/config/stripe.config'
import { db } from '../../../infrastructure/database/db/index'
import {
  bookings,
  bookingSeats,
  payments,
  routes,
  schedules,
  seats,
  trips,
  vehicles
} from '../../../infrastructure/database/schema/schema'

interface CreateReservationInput {
  tripId: string
  seatIds: string[]
  scheduleId: string
  userId: string
  userEmail: string
}

interface CreateReservationOutput {
  success: boolean
  paymentUrl?: string
  error?: string
}

export class CreateReservationUseCase {
  public async execute(input: CreateReservationInput): Promise<CreateReservationOutput> {
    const { tripId, seatIds, scheduleId, userId, userEmail } = input

    try {
      const trip = await db
        .select({ id: trips.id, vehicleId: trips.vehicleId, price: trips.price, routeId: trips.routeId })
        .from(trips)
        .where(eq(trips.id, tripId))
        .then((r) => r[0])
      if (!trip) {
        return { success: false, error: 'Voyage non trouvé' }
      }

      const schedule = await db
        .select({ id: schedules.id, time: schedules.departureTime })
        .from(schedules)
        .where(eq(schedules.id, scheduleId))
        .then((r) => r[0])
      if (!schedule) {
        return { success: false, error: 'Horaire non trouvé' }
      }

      const seatsList = await db.select().from(seats).where(eq(seats.scheduleId, scheduleId))
      const availableSeatIds = seatsList.map((seat) => seat.id)
      const invalidSeats = seatIds.filter((seatId: string) => !availableSeatIds.includes(seatId))
      if (invalidSeats.length > 0) {
        return {
          success: false,
          error: `Les places suivantes n'existent pas pour ce véhicule: ${invalidSeats.join(', ')}`
        }
      }

      if (trip.vehicleId) {
        const vehicleSeats = await db
          .select()
          .from(seats)
          .where(eq(seats.vehicleId, trip.vehicleId))
          .then((rows) => rows.map((seat) => seat.id))

        const invalidVehicleSeats = seatIds.filter((seatId: string) => !vehicleSeats.includes(seatId))
        if (invalidVehicleSeats.length > 0) {
          return {
            success: false,
            error: `Les places suivantes ne sont pas associées au véhicule du voyage: ${invalidVehicleSeats.join(', ')}`
          }
        }
      }

      const bookedSeats = await db
        .select({ seatId: bookingSeats.seatId })
        .from(bookingSeats)
        .leftJoin(bookings, eq(bookingSeats.bookingId, bookings.id))
        .where(and(eq(bookings.tripId, tripId), eq(bookings.scheduleId, scheduleId)))

      const occupiedSeatIds = bookedSeats.map((bs) => bs.seatId)

      const unavailableSeats = seatIds.filter((seatId: string) => occupiedSeatIds.includes(seatId))
      if (unavailableSeats.length > 0) {
        return { success: false, error: `Les places suivantes sont déjà réservées: ${unavailableSeats.join(', ')}` }
      }

      const selectedSeats = seatsList.filter((seat) => seatIds.includes(seat.id))
      const totalAmount = selectedSeats.reduce(
        (sum, seat) => sum + Number.parseFloat(seat.extraFee || '0') + Number.parseFloat(trip.price || '0'),
        0
      )

      const newBooking = await db
        .insert(bookings)
        .values({
          id: randomUUID(),
          tripId,
          scheduleId,
          userId,
          status: 'pending',
          bookedAt: new Date(),
          totalPrice: totalAmount.toString(),
          seatCount: seatIds.length.toString()
        })
        .returning()

      await Promise.all(
        seatIds.map((seatId: any) =>
          db.insert(bookingSeats).values({
            bookingId: newBooking[0].id,
            seatId
          })
        )
      )

      const route = await db
        .select({ departure: routes.departureCity, destination: routes.arrivalCity })
        .from(routes)
        .where(eq(routes.id, trip.routeId!))
        .then((r) => r[0])

      const vehicle = await db
        .select({ name: vehicles.model })
        .from(vehicles)
        .where(eq(vehicles.id, trip.vehicleId!))
        .then((r) => r[0])

      if (!route || !vehicle) {
        return { success: false, error: 'Informations sur le voyage ou le véhicule introuvables' }
      }

      const seatNumbers = await db
        .select({ seatNumber: seats.seatNumber })
        .from(seats)
        .where(inArray(seats.id, seatIds))
        .then((rows) => rows.map((row) => row.seatNumber))

      if (seatNumbers.length !== seatIds.length) {
        return { success: false, error: 'Certaines places sont introuvables' }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Réservation pour le voyage de ${route.departure} à ${route.destination} avec le véhicule ${vehicle.name}, à ${schedule.time}, sièges: ${seatNumbers.join(', ')}`
              },
              unit_amount: Math.round(totalAmount * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${Bun.env.REACT_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${Bun.env.REACT_APP_URL}/cancel`,
        customer_email: userEmail,
        metadata: {
          bookingId: newBooking[0].id
        }
      })

      await db.insert(payments).values({
        id: randomUUID(),
        bookingId: newBooking[0].id,
        amount: totalAmount.toString(),
        paymentIntentId: session.payment_intent?.toString() || '',
        status: 'pending',
        paymentDate: new Date()
      })

      return { success: true, paymentUrl: session.url || '' }
    } catch (error: any) {
      console.error('Erreur lors de la création de la réservation:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}
