import { db } from '../../../infrastructure/database/db/index'
import { vehicles } from '../../../infrastructure/database/schema/schema'

interface CreateVehicleInput {
  registration: string
  type?: string
  seatCount?: string
  model?: string
  status?: string
  equipment?: string
}

interface CreateVehicleOutput {
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

export class CreateVehicleUseCase {
  public async execute(input: CreateVehicleInput): Promise<CreateVehicleOutput> {
    const { registration, type, seatCount, model, status, equipment } = input

    try {
      const vehicleId = crypto.randomUUID()
      const newVehicle = await db
        .insert(vehicles)
        .values({
          id: vehicleId,
          registration,
          type: type || null,
          seatCount: seatCount || null,
          model: model || null,
          status: status || 'active',
          equipment: equipment || null
        })
        .returning()

      if (!newVehicle[0]) {
        return { success: false, error: 'Erreur lors de la création du véhicule' }
      }

      return {
        success: true,
        data: {
          id: newVehicle[0].id,
          registration: newVehicle[0].registration || '',
          type: newVehicle[0].type,
          seatCount: newVehicle[0].seatCount,
          model: newVehicle[0].model,
          status: newVehicle[0].status,
          equipment: newVehicle[0].equipment
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du véhicule:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: add vehicle validation - 2025-06-21
