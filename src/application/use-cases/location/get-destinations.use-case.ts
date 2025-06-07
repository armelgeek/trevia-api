import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { routes } from '../../../infrastructure/database/schema/schema'

interface GetDestinationsInput {
  city: string
}

interface GetDestinationsOutput {
  success: boolean
  data?: string[]
  error?: string
}

export class GetDestinationsUseCase {
  public async execute(input: GetDestinationsInput): Promise<GetDestinationsOutput> {
    const { city } = input

    try {
      const destinations = await db
        .select({ city: routes.arrivalCity })
        .from(routes)
        .where(eq(routes.departureCity, city))
        .groupBy(routes.arrivalCity)

      const cities = destinations.map((row) => row.city).filter((city): city is string => city !== null)

      return {
        success: true,
        data: cities
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des destinations:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: implement location services - Development on 2025-06-06

// feat: add geocoding functionality - Development on 2025-06-06

// fix: location data validation - Development on 2025-06-07
