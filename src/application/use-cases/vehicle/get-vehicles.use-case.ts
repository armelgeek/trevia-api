import { db } from '../../../infrastructure/database/db/index'
import { vehicles } from '../../../infrastructure/database/schema/schema'

interface GetVehiclesInput {
  page?: string
  limit?: string
}

interface VehicleData {
  id: string
  registration: string
  type: string | null
  seatCount: string | null
  model: string | null
  status: string | null
  equipment: string | null
}

interface GetVehiclesOutput {
  success: boolean
  data?: VehicleData[]
  page?: number
  limit?: number
  total?: number
  error?: string
}

export class GetVehiclesUseCase {
  public async execute(input: GetVehiclesInput): Promise<GetVehiclesOutput> {
    const { page = '1', limit = '20' } = input
    const pageNum = Math.max(1, Number.parseInt(page))
    const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    try {
      // Récupérer tous les véhicules
      const allVehicles = await db.select().from(vehicles)

      // Appliquer la pagination
      const paginatedVehicles = allVehicles.slice(offset, offset + limitNum)

      const formattedVehicles: VehicleData[] = paginatedVehicles.map((vehicle) => ({
        id: vehicle.id,
        registration: vehicle.registration || '',
        type: vehicle.type,
        seatCount: vehicle.seatCount,
        model: vehicle.model,
        status: vehicle.status,
        equipment: vehicle.equipment
      }))

      return {
        success: true,
        data: formattedVehicles,
        page: pageNum,
        limit: limitNum,
        total: allVehicles.length
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des véhicules:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create vehicle model and schema - 2025-06-21

// feat: implement vehicle CRUD operations - Development on 2025-05-28
