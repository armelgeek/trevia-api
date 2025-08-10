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
    },
    {
      id: 'route_4',
      departureCity: 'Paris',
      arrivalCity: 'Bordeaux',
      distanceKm: '580',
      duration: '5h45',
      basePrice: '45',
      routeType: 'express',
      status: 'active'
    },
    {
      id: 'route_5',
      departureCity: 'Lyon',
      arrivalCity: 'Toulouse',
      distanceKm: '540',
      duration: '5h30',
      basePrice: '42',
      routeType: 'standard',
      status: 'active'
    },
    {
      id: 'route_6',
      departureCity: 'Marseille',
      arrivalCity: 'Nice',
      distanceKm: '200',
      duration: '2h30',
      basePrice: '22',
      routeType: 'standard',
      status: 'active'
    },
    {
      id: 'route_7',
      departureCity: 'Paris',
      arrivalCity: 'Strasbourg',
      distanceKm: '490',
      duration: '5h00',
      basePrice: '38',
      routeType: 'express',
      status: 'active'
    },
    {
      id: 'route_8',
      departureCity: 'Bordeaux',
      arrivalCity: 'Toulouse',
      distanceKm: '250',
      duration: '2h45',
      basePrice: '25',
      routeType: 'standard',
      status: 'active'
    },
    {
      id: 'route_9',
      departureCity: 'Lille',
      arrivalCity: 'Strasbourg',
      distanceKm: '520',
      duration: '5h15',
      basePrice: '40',
      routeType: 'express',
      status: 'active'
    },
    {
      id: 'route_10',
      departureCity: 'Lyon',
      arrivalCity: 'Strasbourg',
      distanceKm: '410',
      duration: '4h15',
      basePrice: '32',
      routeType: 'standard',
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
      equipment: 'wifi,clim,usb'
    },
    {
      id: 'veh_2',
      registration: 'CC-456-DD',
      type: 'minibus',
      seatCount: '20',
      model: 'Mercedes Sprinter',
      status: 'active',
      equipment: 'wifi,clim,usb,tv'
    },
    {
      id: 'veh_3',
      registration: 'EE-789-FF',
      type: 'autocar',
      seatCount: '52',
      model: 'Volvo 9700',
      status: 'active',
      equipment: 'wifi,clim,toilettes,tv'
    },
    {
      id: 'veh_4',
      registration: 'GG-012-HH',
      type: 'minibus',
      seatCount: '18',
      model: 'Iveco Daily',
      status: 'active',
      equipment: 'wifi,clim,usb'
    },
    {
      id: 'veh_5',
      registration: 'II-345-JJ',
      type: 'autocar',
      seatCount: '48',
      model: 'Scania Touring',
      status: 'active',
      equipment: 'wifi,clim,toilettes,tv,usb'
    },
    {
      id: 'veh_6',
      registration: 'KK-678-LL',
      type: 'minibus',
      seatCount: '22',
      model: 'Mercedes Sprinter VIP',
      status: 'active',
      equipment: 'wifi,clim,usb,tv,minibar'
    }
  ])

  await db.insert(drivers).values([
    {
      id: 'drv_1',
      firstName: 'Jean',
      lastName: 'Dupont',
      license: 'B123456789',
      certifications: 'Transport voyageurs, Premier secours',
      phone: '+33123456789',
      status: 'active',
      reviews: 'Excellent conducteur'
    },
    {
      id: 'drv_2',
      firstName: 'Marie',
      lastName: 'Martin',
      license: 'B987654321',
      certifications: 'Transport voyageurs, Conduite écologique',
      phone: '+33987654321',
      status: 'active',
      reviews: 'Très professionnelle'
    },
    {
      id: 'drv_3',
      firstName: 'Pierre',
      lastName: 'Durand',
      license: 'B456789123',
      certifications: 'Transport voyageurs, Longue distance',
      phone: '+33456789123',
      status: 'active',
      reviews: 'Conducteur expérimenté'
    },
    {
      id: 'drv_4',
      firstName: 'Sophie',
      lastName: 'Bernard',
      license: 'B789123456',
      certifications: 'Transport voyageurs, Service client',
      phone: '+33789123456',
      status: 'active',
      reviews: 'Très appréciée des clients'
    },
    {
      id: 'drv_5',
      firstName: 'Lucas',
      lastName: 'Petit',
      license: 'B234567891',
      certifications: 'Transport voyageurs, Mécanique',
      phone: '+33234567891',
      status: 'active',
      reviews: 'Professionnel et ponctuel'
    }
  ])

  const tripTemplates = [
    {
      id: 'trip_template_1',
      routeId: 'route_1', // Paris-Lyon (Express)
      vehicleId: 'veh_3', // Volvo 9700 (grand autocar)
      driverId: 'drv_1',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '35'
    },
    {
      id: 'trip_template_2',
      routeId: 'route_2', // Lyon-Marseille (Standard)
      vehicleId: 'veh_2', // Mercedes Sprinter
      driverId: 'drv_2',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '28'
    },
    {
      id: 'trip_template_3',
      routeId: 'route_3', // Paris-Lille (Express)
      vehicleId: 'veh_6', // Mercedes Sprinter VIP
      driverId: 'drv_3',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '18'
    },
    {
      id: 'trip_template_4',
      routeId: 'route_4', // Paris-Bordeaux (Express)
      vehicleId: 'veh_5', // Scania Touring
      driverId: 'drv_4',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '45'
    },
    {
      id: 'trip_template_5',
      routeId: 'route_5', // Lyon-Toulouse (Standard)
      vehicleId: 'veh_3', // Volvo 9700
      driverId: 'drv_5',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '42'
    },
    {
      id: 'trip_template_6',
      routeId: 'route_6', // Marseille-Nice (Standard)
      vehicleId: 'veh_4', // Iveco Daily
      driverId: 'drv_1',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '22'
    },
    {
      id: 'trip_template_7',
      routeId: 'route_7', // Paris-Strasbourg (Express)
      vehicleId: 'veh_5', // Scania Touring
      driverId: 'drv_2',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '38'
    },
    {
      id: 'trip_template_8',
      routeId: 'route_8', // Bordeaux-Toulouse (Standard)
      vehicleId: 'veh_1', // Renault Master
      driverId: 'drv_3',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '25'
    },
    {
      id: 'trip_template_9',
      routeId: 'route_9', // Lille-Strasbourg (Express)
      vehicleId: 'veh_3', // Volvo 9700
      driverId: 'drv_4',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '40'
    },
    {
      id: 'trip_template_10',
      routeId: 'route_10', // Lyon-Strasbourg (Standard)
      vehicleId: 'veh_2', // Mercedes Sprinter
      driverId: 'drv_5',
      departureDate: null,
      arrivalDate: null,
      status: 'template',
      price: '32'
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

  // Configuration des sièges par type de véhicule
  type VehicleConfig = {
    rows: number
    cols: number
    premiumRows: number
  }

  type VehicleConfigs = {
    [key: string]: VehicleConfig
  }

  const vehicleConfigs: VehicleConfigs = {
    veh_1: { rows: 4, cols: 4, premiumRows: 2 }, // Renault Master (16 places)
    veh_2: { rows: 5, cols: 4, premiumRows: 2 }, // Mercedes Sprinter (20 places)
    veh_3: { rows: 13, cols: 4, premiumRows: 3 }, // Volvo 9700 (52 places)
    veh_4: { rows: 5, cols: 4, premiumRows: 2 }, // Iveco Daily (18 places)
    veh_5: { rows: 12, cols: 4, premiumRows: 3 }, // Scania Touring (48 places)
    veh_6: { rows: 6, cols: 4, premiumRows: 3 } // Mercedes Sprinter VIP (22 places)
  }

  // Génération des sièges pour tous les véhicules
  const allSeatsToInsert = []

  // 1. Sièges de base pour chaque véhicule (sans scheduleId)
  for (const [vehicleId, config] of Object.entries(vehicleConfigs)) {
    for (let row = 1; row <= config.rows; row++) {
      for (let col = 1; col <= config.cols; col++) {
        allSeatsToInsert.push({
          id: randomUUID(),
          vehicleId,
          seatNumber: `${row}${String.fromCharCode(64 + col)}`, // 1A, 1B, etc.
          seatType: row <= config.premiumRows ? 'premium' : 'standard',
          row: row.toString(),
          col: col.toString(),
          extraFee: row <= config.premiumRows ? '12' : '0',
          scheduleId: null
        })
      }
    }
  }

  // 2. Sièges pour chaque horaire de chaque véhicule
  const allSchedules = await db
    .select({
      scheduleId: schedules.id,
      vehicleId: trips.vehicleId
    })
    .from(schedules)
    .innerJoin(trips, eq(trips.id, schedules.tripId))

  // Regrouper les horaires par véhicule
  type SchedulesByVehicle = {
    [key: string]: string[]
  }

  const schedulesByVehicle = allSchedules.reduce<SchedulesByVehicle>((acc, schedule) => {
    const vehicleId = schedule.vehicleId as string
    if (!acc[vehicleId]) {
      acc[vehicleId] = []
    }
    acc[vehicleId].push(schedule.scheduleId as string)
    return acc
  }, {})

  // Générer les sièges pour chaque horaire
  for (const [vehicleId, scheduleIds] of Object.entries(schedulesByVehicle)) {
    const config = vehicleConfigs[vehicleId]
    if (!config) continue

    for (const scheduleId of scheduleIds) {
      for (let row = 1; row <= config.rows; row++) {
        for (let col = 1; col <= config.cols; col++) {
          allSeatsToInsert.push({
            id: randomUUID(),
            vehicleId,
            seatNumber: `${row}${String.fromCharCode(64 + col)}`,
            seatType: row <= config.premiumRows ? 'premium' : 'standard',
            row: row.toString(),
            col: col.toString(),
            extraFee: row <= config.premiumRows ? '12' : '0',
            scheduleId
          })
        }
      }
    }
  }

  await db.insert(seats).values(allSeatsToInsert)

  console.info('🕒 Création des horaires pour chaque voyage...')

  const allTripInstances = await db.select().from(trips).where(eq(trips.status, 'scheduled'))
  const schedulesToInsert = []

  type RouteType = 'express' | 'standard'
  type Schedule = {
    departure: string
    arrival: string
    label: string
  }

  // Horaires différents selon le type de route
  const schedulesByType: Record<RouteType, Schedule[]> = {
    express: [
      { departure: '07:00', arrival: '11:30', label: 'Matin' },
      { departure: '13:00', arrival: '17:30', label: 'Après-midi' },
      { departure: '18:00', arrival: '22:30', label: 'Soir' }
    ],
    standard: [
      { departure: '08:30', arrival: '13:30', label: 'Matin' },
      { departure: '14:30', arrival: '19:30', label: 'Après-midi' },
      { departure: '19:30', arrival: '00:30', label: 'Soir' }
    ]
  }

  for (const trip of allTripInstances) {
    if (!trip.departureDate || !trip.routeId) continue

    // Récupérer le type de route (express/standard) pour ce voyage
    const route = await db
      .select({ routeType: routes.routeType })
      .from(routes)
      .where(eq(routes.id, trip.routeId as string))
      .then((results) => results[0])

    const routeType = (route?.routeType ?? 'standard') as RouteType
    const schedules = schedulesByType[routeType]

    for (const schedule of schedules) {
      schedulesToInsert.push({
        id: randomUUID(),
        tripId: trip.id,
        departureTime: schedule.departure,
        arrivalTime: schedule.arrival,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }

  await db.insert(schedules).values(schedulesToInsert)

  console.info(`✅ ${schedulesToInsert.length} horaires créés pour ${allTripInstances.length} voyages`)

  // Génération intelligente des voyages pour les 30 prochains jours
  const tripsToInsert = []

  for (let i = 1; i <= 30; i++) {
    // Pour chaque jour, on crée 2-3 voyages par template de manière aléatoire
    for (const template of tripTemplates) {
      const tripsPerDay = Math.floor(Math.random() * 2) + 2 // 2 ou 3 voyages par jour

      for (let j = 0; j < tripsPerDay; j++) {
        // Calcul du prix avec variation selon le jour (weekend +10%, heures de pointe +5%)
        const basePrice = Number.parseInt(template.price, 10)
        const tripDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
        const isWeekend = tripDate.getDay() % 6 === 0
        const priceAdjustment = isWeekend ? 1.1 : 1.05
        const finalPrice = Math.round(basePrice * priceAdjustment).toString()

        tripsToInsert.push({
          id: randomUUID(),
          routeId: template.routeId,
          vehicleId: template.vehicleId,
          driverId: template.driverId,
          departureDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
          arrivalDate: null,
          status: 'scheduled',
          price: finalPrice
        })
      }
    }
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
