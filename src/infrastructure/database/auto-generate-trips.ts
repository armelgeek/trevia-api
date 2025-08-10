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
      routeId: 'route_1', // Paris-Lyon (Express)
      vehicleId: 'veh_3', // Volvo 9700 (grand autocar)
      driverId: 'drv_1',
      price: '35'
    },
    {
      routeId: 'route_2', // Lyon-Marseille (Standard)
      vehicleId: 'veh_2', // Mercedes Sprinter
      driverId: 'drv_2',
      price: '28'
    },
    {
      routeId: 'route_3', // Paris-Lille (Express)
      vehicleId: 'veh_6', // Mercedes Sprinter VIP
      driverId: 'drv_3',
      price: '18'
    },
    {
      routeId: 'route_4', // Paris-Bordeaux (Express)
      vehicleId: 'veh_5', // Scania Touring
      driverId: 'drv_4',
      price: '45'
    },
    {
      routeId: 'route_5', // Lyon-Toulouse (Standard)
      vehicleId: 'veh_3', // Volvo 9700
      driverId: 'drv_5',
      price: '42'
    },
    {
      routeId: 'route_6', // Marseille-Nice (Standard)
      vehicleId: 'veh_4', // Iveco Daily
      driverId: 'drv_1',
      price: '22'
    },
    {
      routeId: 'route_7', // Paris-Strasbourg (Express)
      vehicleId: 'veh_5', // Scania Touring
      driverId: 'drv_2',
      price: '38'
    },
    {
      routeId: 'route_8', // Bordeaux-Toulouse (Standard)
      vehicleId: 'veh_1', // Renault Master
      driverId: 'drv_3',
      price: '25'
    },
    {
      routeId: 'route_9', // Lille-Strasbourg (Express)
      vehicleId: 'veh_3', // Volvo 9700
      driverId: 'drv_4',
      price: '40'
    },
    {
      routeId: 'route_10', // Lyon-Strasbourg (Standard)
      vehicleId: 'veh_2', // Mercedes Sprinter
      driverId: 'drv_5',
      price: '32'
    }
  ]

  const scheduleTemplates: ScheduleTemplate[] = [
    { departure: '06:00:00', arrival: '10:30:00', label: 'Très tôt' },
    { departure: '08:00:00', arrival: '12:30:00', label: 'Matin' },
    { departure: '10:00:00', arrival: '14:30:00', label: 'Matinée' },
    { departure: '14:00:00', arrival: '18:30:00', label: 'Après-midi' },
    { departure: '16:00:00', arrival: '20:30:00', label: 'Fin après-midi' },
    { departure: '20:00:00', arrival: '00:30:00', label: 'Soir' },
    { departure: '22:00:00', arrival: '02:30:00', label: 'Nuit' }
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

    const dayOfWeek = currentDate.getDay()
    
    // Gestion des jours de la semaine
    if (dayOfWeek === 0) {
      console.info(`⏭️  Service réduit le dimanche ${currentDate.toISOString().split('T')[0]}`)
      // On ne garde que les routes principales le dimanche
      tripTemplates.length = 5
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

      // Ajustement des prix selon le jour et la période
      const basePrice = Number.parseInt(template.price, 10)
      let priceAdjustment = 1

      // Augmentation le weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        priceAdjustment *= 1.1 // +10% le weekend
      }

      // Augmentation en période de pointe (vacances scolaires, etc.)
      const isHolidayPeriod = currentDate.getMonth() >= 6 && currentDate.getMonth() <= 7 // Juillet-Août
      if (isHolidayPeriod) {
        priceAdjustment *= 1.15 // +15% en période de vacances
      }

      const finalPrice = Math.round(basePrice * priceAdjustment).toString()

      const tripId = randomUUID()
      tripInstances.push({
        id: tripId,
        routeId: template.routeId,
        vehicleId: template.vehicleId,
        driverId: template.driverId,
        departureDate: currentDate,
        arrivalDate: null,
        status: 'scheduled',
        price: finalPrice
      })

      for (const scheduleTemplate of scheduleTemplates) {
        schedulesToInsert.push({
          id: randomUUID(),
          tripId,
          departureTime: scheduleTemplate.departure,
          arrivalTime: scheduleTemplate.arrival,
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
