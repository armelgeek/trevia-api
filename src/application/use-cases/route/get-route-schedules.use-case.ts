import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'

interface GetRouteSchedulesInput {
  id: string
  date_start?: string
  date_end?: string
}

interface ScheduleData {
  id: string
  routeId: string
  departureTime: string | null
  weekDays: string | null
  period: string | null
  frequency: string | null
}

interface GetRouteSchedulesOutput {
  success: boolean
  data?: ScheduleData[]
  error?: string
}

export class GetRouteSchedulesUseCase {
  public async execute(input: GetRouteSchedulesInput): Promise<GetRouteSchedulesOutput> {
    const { id } = input

    try {
      let data = await db.query.schedules.findMany({ where: (s: any) => eq(s.tripId, id) })

      data = data.filter((s: any) => s.tripId !== null)

      const safeData = data.map((s: any) => ({ ...s, routeId: s.tripId! }))

      return { success: true, data: safeData }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des horaires:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: implement route CRUD operations - 2025-06-21
