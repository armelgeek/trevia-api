import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { vehicles } from '../../../infrastructure/database/schema/schema'

interface UpdateVehicleInput {
  vehicleId: string
  registration?: string
  type?: string
  seatCount?: string
  model?: string
  status?: string
  equipment?: string
}

interface UpdateVehicleOutput {
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

export class UpdateVehicleUseCase {
  public async execute(input: UpdateVehicleInput): Promise<UpdateVehicleOutput> {
    const { vehicleId, registration, type, seatCount, model, status, equipment } = input

    try {
      // Vérifier que le véhicule existe
      const existingVehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId))
        .then((r) => r[0])

      if (!existingVehicle) {
        return { success: false, error: 'Véhicule non trouvé' }
      }

      // Mettre à jour le véhicule
      const updatedVehicle = await db
        .update(vehicles)
        .set({
          registration: registration !== undefined ? registration : existingVehicle.registration,
          type: type !== undefined ? type : existingVehicle.type,
          seatCount: seatCount !== undefined ? seatCount : existingVehicle.seatCount,
          model: model !== undefined ? model : existingVehicle.model,
          status: status !== undefined ? status : existingVehicle.status,
          equipment: equipment !== undefined ? equipment : existingVehicle.equipment
        })
        .where(eq(vehicles.id, vehicleId))
        .returning()

      if (!updatedVehicle[0]) {
        return { success: false, error: 'Erreur lors de la mise à jour du véhicule' }
      }

      return {
        success: true,
        data: {
          id: updatedVehicle[0].id,
          registration: updatedVehicle[0].registration || '',
          type: updatedVehicle[0].type,
          seatCount: updatedVehicle[0].seatCount,
          model: updatedVehicle[0].model,
          status: updatedVehicle[0].status,
          equipment: updatedVehicle[0].equipment
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du véhicule:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: implement vehicle CRUD operations - 2025-06-21

// feat: create vehicle model and schema - Development on 2025-05-27
