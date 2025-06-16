import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from './db/index'
import { drivers, options, routes, schedules, seats, trips, vehicles } from './schema/schema'

async function completeSeed() {
  console.info('🚀 Démarrage du seed complet...')

  await db.insert(routes).values([
    {
      id: 'route_1',
      departureCity: 'Paris',
      arrivalCity: 'Lyon',
      distanceKm: '460',
      duration: '4h30',
      basePrice: '35',
      routeType: 'express',
      status: 'active'
    },
    {
      id: 'route_2',
      departureCity: 'Lyon',
      arrivalCity: 'Marseille',
      distanceKm: '315',
      duration: '3h',
      basePrice: '28',
      routeType: 'standard',
      status: 'active'
    },
    {
      id: 'route_3',
      departureCity: 'Paris',
      arrivalCity: 'Lille',
      distanceKm: '220',
      duration: '2h15',
      basePrice: '18',
      routeType: 'express',
      status: 'active'
    }
  ])

  await db.insert(vehicles).values([
    {
      id: 'veh_1',
      registration: 'AA-123-BB',
      type: 'minibus',
      seatCount: '16',
      model: 'Renault Master',
      status: 'active',
      equipment: 'wifi,clim'
    },
    {
      id: 'veh_2',
      registration: 'CC-456-DD',
      type: 'minibus',
      seatCount: '20',
      model: 'Mercedes Sprinter',
      status: 'active',
      equipment: 'wifi,clim'
    }
  ])

  await db.insert(drivers).values([
    {
      id: 'drv_1',
      firstName: 'Jean',
      lastName: 'Dupont',
      license: 'B123456789',
      certifications: 'Transport voyageurs',
      phone: '+33123456789',
      status: 'active',
      reviews: 'Excellent conducteur'
    },
    {
      id: 'drv_2',
      firstName: 'Marie',
      lastName: 'Martin',
      license: 'B987654321',
      certifications: 'Transport voyageurs',
      phone: '+33987654321',
      status: 'active',
      reviews: 'Très professionnelle'
    }
  ])

  const tripTemplates = [
    {
      id: 'trip_template_1',
      routeId: 'route_1',
      vehicleId: 'veh_1',
      driverId: 'drv_1',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '35'
    },
    {
      id: 'trip_template_2',
      routeId: 'route_2',
      vehicleId: 'veh_2',
      driverId: 'drv_2',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '28'
    },
    {
      id: 'trip_template_3',
      routeId: 'route_3',
      vehicleId: 'veh_1',
      driverId: 'drv_1',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '18'
    }
  ]

  await db.insert(trips).values(tripTemplates)

  const tripInstances = []
  const today = new Date()

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + dayOffset)

    for (const template of tripTemplates) {
      tripInstances.push({
        id: randomUUID(),
        routeId: template.routeId,
        vehicleId: template.vehicleId,
        driverId: template.driverId,
        departureDate: currentDate,
        arrivalDate: null,
        status: 'scheduled',
        price: template.price
      })
    }
  }

  await db.insert(trips).values(tripInstances)

  await db.insert(options).values([
    {
      id: 'opt_1',
      name: 'Wifi',
      description: 'Connexion internet gratuite',
      extraPrice: '0',
      optionType: 'service'
    },
    {
      id: 'opt_2',
      name: 'Repas',
      description: 'Collation incluse',
      extraPrice: '8',
      optionType: 'meal'
    },
    {
      id: 'opt_3',
      name: 'Siège premium',
      description: "Siège avec plus d'espace",
      extraPrice: '12',
      optionType: 'comfort'
    }
  ])

  const seatsVeh1 = []
  for (let row = 1; row <= 4; row++) {
    for (let col = 1; col <= 4; col++) {
      seatsVeh1.push({
        id: randomUUID(),
        vehicleId: 'veh_1',
        seatNumber: `${row}${String.fromCharCode(64 + col)}`,
        seatType: row <= 2 ? 'premium' : 'standard',
        row: row.toString(),
        col: col.toString(),
        extraFee: row <= 2 ? '12' : '0',
        scheduleId: null
      })
    }
  }

  const schedulesVeh1 = await db
    .select({ scheduleId: schedules.id })
    .from(schedules)
    .innerJoin(trips, eq(trips.id, schedules.tripId))
    .where(eq(trips.vehicleId, 'veh_1'))

  for (const schedule of schedulesVeh1) {
    for (let row = 1; row <= 5; row++) {
      for (let col = 1; col <= 4; col++) {
        seatsVeh1.push({
          id: randomUUID(),
          vehicleId: 'veh_1',
          seatNumber: `${row}${String.fromCharCode(64 + col)}`,
          seatType: row <= 2 ? 'premium' : 'standard',
          row: row.toString(),
          col: col.toString(),
          extraFee: row <= 2 ? '12' : '0',
          scheduleId: schedule.scheduleId
        })
      }
    }
  }

  await db.insert(seats).values(seatsVeh1)

  const seatsVeh2 = []
  for (let row = 1; row <= 5; row++) {
    for (let col = 1; col <= 4; col++) {
      seatsVeh2.push({
        id: randomUUID(),
        vehicleId: 'veh_2',
        seatNumber: `${row}${String.fromCharCode(64 + col)}`,
        seatType: row <= 2 ? 'premium' : 'standard',
        row: row.toString(),
        col: col.toString(),
        extraFee: row <= 2 ? '12' : '0',
        scheduleId: null
      })
    }
  }

  const schedulesVeh2 = await db
    .select({ scheduleId: schedules.id })
    .from(schedules)
    .innerJoin(trips, eq(trips.id, schedules.tripId))
    .where(eq(trips.vehicleId, 'veh_2'))

  for (const schedule of schedulesVeh2) {
    for (let row = 1; row <= 5; row++) {
      for (let col = 1; col <= 4; col++) {
        seatsVeh2.push({
          id: randomUUID(),
          vehicleId: 'veh_2',
          seatNumber: `${row}${String.fromCharCode(64 + col)}`,
          seatType: row <= 2 ? 'premium' : 'standard',
          row: row.toString(),
          col: col.toString(),
          extraFee: row <= 2 ? '12' : '0',
          scheduleId: schedule.scheduleId
        })
      }
    }
  }

  await db.insert(seats).values(seatsVeh2)

  console.info('🕒 Création des horaires pour chaque voyage...')

  const allTripInstances = await db.select().from(trips).where(eq(trips.status, 'scheduled'))
  const schedulesToInsert = []

  const standardSchedules = [
    { departure: '08:00:00', arrival: '12:30:00', label: 'Matin' },
    { departure: '14:00:00', arrival: '18:30:00', label: 'Après-midi' },
    { departure: '20:00:00', arrival: '00:30:00', label: 'Soir' }
  ]

  for (const trip of allTripInstances) {
    if (!trip.departureDate) continue

    for (const schedule of standardSchedules) {
      const departureDateTime = new Date(trip.departureDate)
      const [depHour, depMin, depSec] = schedule.departure.split(':')
      departureDateTime.setHours(Number.parseInt(depHour), Number.parseInt(depMin), Number.parseInt(depSec))

      const arrivalDateTime = new Date(trip.departureDate)
      const [arrHour, arrMin, arrSec] = schedule.arrival.split(':')
      arrivalDateTime.setHours(Number.parseInt(arrHour), Number.parseInt(arrMin), Number.parseInt(arrSec))

      if (arrivalDateTime < departureDateTime) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1)
      }

      schedulesToInsert.push({
        id: randomUUID(),
        tripId: trip.id,
        departureTime: departureDateTime,
        arrivalTime: arrivalDateTime,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }

  await db.insert(schedules).values(schedulesToInsert)

  console.info(`✅ ${schedulesToInsert.length} horaires créés pour ${allTripInstances.length} voyages`)

  const tripsToInsert = []
  for (let i = 1; i <= 25; i++) {
    tripsToInsert.push({
      id: randomUUID(),
      routeId: `route_${(i % 3) + 1}`,
      vehicleId: `veh_${(i % 2) + 1}`,
      driverId: `drv_${(i % 2) + 1}`,
      departureDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      arrivalDate: null,
      status: 'scheduled',
      price: (20 + i).toString()
    })
  }

  await db.insert(trips).values(tripsToInsert)
  console.info(`✅ 25 voyages générés et insérés dans la base de données.`)

  const seatsToInsert = []
  const schs = await db
    .select({ id: schedules.id, vehicleId: trips.vehicleId })
    .from(schedules)
    .innerJoin(trips, eq(trips.id, schedules.tripId))

  for (const schedule of schs) {
    for (let row = 1; row <= 5; row++) {
      for (let col = 1; col <= 4; col++) {
        seatsToInsert.push({
          id: randomUUID(),
          vehicleId: schedule.vehicleId,
          seatNumber: `${row}${String.fromCharCode(64 + col)}`,
          seatType: row <= 2 ? 'premium' : 'standard',
          row: row.toString(),
          col: col.toString(),
          extraFee: row <= 2 ? '12' : '0',
          scheduleId: schedule.id
        })
      }
    }
  }

  await db.insert(seats).values(seatsToInsert)
  console.info(`✅ ${seatsToInsert.length} sièges générés et insérés.`)

  console.info('✅ Seed complet terminé avec succès !')
}

completeSeed().catch((error) => {
  console.error('❌ Erreur lors du seed complet :', error)
})

// security: add security headers - Development on 2025-06-16
