import { db } from '../../../infrastructure/database/db/index'
import { routes, schedules, trips } from '../../../infrastructure/database/schema/schema'

interface GetPricingInput {
  departureCity?: string
  arrivalCity?: string
}

interface PricingData {
  routeId: string
  departureCity: string
  arrivalCity: string
  basePrice: string
  schedules: (Date | null)[]
}

interface GetPricingOutput {
  success: boolean
  data?: PricingData[]
  error?: string
}

export class GetPricingUseCase {
  public async execute(input: GetPricingInput): Promise<GetPricingOutput> {
    const { departureCity, arrivalCity } = input

    try {
      const allRoutes = await db.select().from(routes)
      const allTrips = await db.select().from(trips)
      const allSchedules = await db.select().from(schedules)

      const filteredRoutes = allRoutes.filter((route) => {
        if (departureCity && route.departureCity?.toLowerCase() !== departureCity.toLowerCase()) return false
        if (arrivalCity && route.arrivalCity?.toLowerCase() !== arrivalCity.toLowerCase()) return false
        return true
      })

      const pricingData: PricingData[] = filteredRoutes.map((route) => {
        // Trouver les trips pour cette route
        const routeTrips = allTrips.filter((trip) => trip.routeId === route.id)

        // Trouver les schedules pour ces trips
        const routeSchedules = allSchedules
          .filter((schedule) => routeTrips.some((trip) => trip.id === schedule.tripId))
          .map((schedule) => schedule.departureTime)

        return {
          routeId: route.id,
          departureCity: route.departureCity || '',
          arrivalCity: route.arrivalCity || '',
          basePrice: route.basePrice || '0',
          schedules: routeSchedules
        }
      })

      return {
        success: true,
        data: pricingData
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des tarifs et horaires:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create pricing model - Development on 2025-06-07

// feat: create pricing controller - Development on 2025-06-08

// feat: add discount system - Development on 2025-06-08

// fix: pricing edge cases - Development on 2025-06-09
