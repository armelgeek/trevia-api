import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { routes } from '../../../infrastructure/database/schema/schema'

interface GetRoutesInput {
  page?: string
  limit?: string
  sort?: string
  filter?: string
}

interface RouteData {
  id: string
  departureCity: string | null
  arrivalCity: string | null
  distanceKm: string | null
  duration: string | null
  basePrice: string | null
  routeType: string | null
  status: string | null
}

interface GetRoutesOutput {
  success: boolean
  data?: RouteData[]
  page?: number
  limit?: number
  total?: number
  error?: string
}

export class GetRoutesUseCase {
  public async execute(input: GetRoutesInput): Promise<GetRoutesOutput> {
    const { page = '1', limit = '20', filter } = input
    const pageNum = Math.max(1, Number.parseInt(page))
    const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    try {
      const data = await db.select().from(routes).where(eq(routes.status, 'active'))

      let filteredData = data
      if (filter) {
        filteredData = data.filter(
          (route) =>
            route.departureCity?.toLowerCase().includes(filter.toLowerCase()) ||
            route.arrivalCity?.toLowerCase().includes(filter.toLowerCase())
        )
      }

      const paginatedData = filteredData.slice(offset, offset + limitNum)

      return {
        success: true,
        data: paginatedData,
        page: pageNum,
        limit: limitNum,
        total: filteredData.length
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des routes:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: implement route CRUD operations - Development on 2025-05-29
