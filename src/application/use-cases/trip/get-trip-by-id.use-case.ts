import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { trips } from '../../../infrastructure/database/schema/schema'

interface GetTripByIdInput {
  id: string
}

interface GetTripByIdOutput {
  success: boolean
  data?: any
  error?: string
}

export class GetTripByIdUseCase {
  public async execute(input: GetTripByIdInput): Promise<GetTripByIdOutput> {
    const { id } = input

    try {
      const trip = await db
        .select()
        .from(trips)
        .where(eq(trips.id, id))
        .then((r) => r[0])

      if (!trip) {
        return { success: false, error: 'Voyage non trouvé' }
      }

      return { success: true, data: trip }
    } catch (error: any) {
      console.error('Erreur lors de la récupération du voyage:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create reservation controller - Development on 2025-06-05
