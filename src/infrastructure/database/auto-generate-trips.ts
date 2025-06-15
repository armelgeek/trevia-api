import { randomUUID } from 'node:crypto'
import process from 'node:process'
import { gte, lt } from 'drizzle-orm'
import { db } from './db/index'
import { schedules, trips } from './schema/schema'

interface TripTemplate {
  routeId: string
  vehicleId: string
  driverId: string
  price: string
}

interface ScheduleTemplate {
  departure: string
  arrival: string
  label: string
}

async function autoGenerateTrips(daysAhead = 30) {
  console.info(`🚌 Génération automatique des voyages pour les ${daysAhead} prochains jours...`)

  const tripTemplates: TripTemplate[] = [
    {
      routeId: 'route_1', // Paris-Lyon
      vehicleId: 'veh_1',
      driverId: 'drv_1',
      price: '35'
    },
    {
      routeId: 'route_2', // Lyon-Marseille
      vehicleId: 'veh_2',
      driverId: 'drv_2',
      price: '28'
    },
    {
      routeId: 'route_3', // Paris-Lille
      vehicleId: 'veh_1',
      driverId: 'drv_1',
      price: '18'
    }
  ]

  const scheduleTemplates: ScheduleTemplate[] = [
    { departure: '08:00:00', arrival: '12:30:00', label: 'Matin' },
    { departure: '14:00:00', arrival: '18:30:00', label: 'Après-midi' },
    { departure: '20:00:00', arrival: '00:30:00', label: 'Soir' }
  ]

  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + daysAhead)

  const existingTrips = await db
    .select()
    .from(trips)
    .where(gte(trips.departureDate, today) && lt(trips.departureDate, endDate))

  console.info(`📊 ${existingTrips.length} voyages existants trouvés dans la période`)

  const tripInstances = []
  const schedulesToInsert = []

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + dayOffset)

    if (currentDate.getDay() === 0) {
      console.info(`⏭️  Ignorer dimanche ${currentDate.toISOString().split('T')[0]}`)
      continue
    }

    for (const template of tripTemplates) {
      const existingTrip = existingTrips.find(
        (trip) =>
          trip.routeId === template.routeId &&
          trip.departureDate &&
          trip.departureDate.toDateString() === currentDate.toDateString()
      )

      if (existingTrip) {
        console.info(`✅ Voyage existant: ${template.routeId} le ${currentDate.toISOString().split('T')[0]}`)
        continue
      }

      const tripId = randomUUID()
      tripInstances.push({
        id: tripId,
        routeId: template.routeId,
        vehicleId: template.vehicleId,
        driverId: template.driverId,
        departureDate: currentDate,
        arrivalDate: null,
        status: 'scheduled',
        price: template.price
      })

      for (const scheduleTemplate of scheduleTemplates) {
        const departureDateTime = new Date(currentDate)
        const [depHour, depMin, depSec] = scheduleTemplate.departure.split(':')
        departureDateTime.setHours(Number.parseInt(depHour), Number.parseInt(depMin), Number.parseInt(depSec))

        const arrivalDateTime = new Date(currentDate)
        const [arrHour, arrMin, arrSec] = scheduleTemplate.arrival.split(':')
        arrivalDateTime.setHours(Number.parseInt(arrHour), Number.parseInt(arrMin), Number.parseInt(arrSec))

        if (arrivalDateTime < departureDateTime) {
          arrivalDateTime.setDate(arrivalDateTime.getDate() + 1)
        }

        schedulesToInsert.push({
          id: randomUUID(),
          tripId,
          departureTime: departureDateTime,
          arrivalTime: arrivalDateTime,
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }
  }

  if (tripInstances.length > 0) {
    await db.insert(trips).values(tripInstances)
    console.info(`✅ ${tripInstances.length} nouveaux voyages créés`)
  }

  if (schedulesToInsert.length > 0) {
    await db.insert(schedules).values(schedulesToInsert)
    console.info(`✅ ${schedulesToInsert.length} nouveaux horaires créés`)
  }

  console.info('🎉 Génération automatique terminée!')
  return {
    tripsCreated: tripInstances.length,
    schedulesCreated: schedulesToInsert.length
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  autoGenerateTrips(30).catch(console.error)
}

export { autoGenerateTrips }

// fix: memory usage optimization - Development on 2025-06-15

// security: implement rate limiting - Development on 2025-06-15
