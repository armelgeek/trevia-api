import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { vehicles } from '../../../infrastructure/database/schema/schema'

interface GetVehicleByIdInput {
  vehicleId: string
}

interface GetVehicleByIdOutput {
  success: boolean
  data?: {
    id: string
    registration: string
    type: string | null
    seatCount: string | null
    model: string | null
    status: string | null
    equipment: string | null
  }
  error?: string
}

export class GetVehicleByIdUseCase {
  public async execute(input: GetVehicleByIdInput): Promise<GetVehicleByIdOutput> {
    const { vehicleId } = input

    try {
      const vehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId))
        .then((r) => r[0])

      if (!vehicle) {
        return { success: false, error: 'Véhicule non trouvé' }
      }

      return {
        success: true,
        data: {
          id: vehicle.id,
          registration: vehicle.registration || '',
          type: vehicle.type,
          seatCount: vehicle.seatCount,
          model: vehicle.model,
          status: vehicle.status,
          equipment: vehicle.equipment
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération du véhicule:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create vehicle controller - 2025-06-21
