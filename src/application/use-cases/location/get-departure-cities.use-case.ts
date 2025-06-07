import { db } from '../../../infrastructure/database/db/index'
import { routes } from '../../../infrastructure/database/schema/schema'

interface GetDepartureCitiesOutput {
  success: boolean
  data?: string[]
  error?: string
}

export class GetDepartureCitiesUseCase {
  public async execute(): Promise<GetDepartureCitiesOutput> {
    try {
      const departureCities = await db.select({ city: routes.departureCity }).from(routes).groupBy(routes.departureCity)

      const cities = departureCities.map((row) => row.city).filter((city): city is string => city !== null)

      return {
        success: true,
        data: cities
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des villes de départ:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create location model - Development on 2025-06-06

// feat: add location search - Development on 2025-06-07
