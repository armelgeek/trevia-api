import { db } from '../../../infrastructure/database/db/index'
import { seats, vehicles } from '../../../infrastructure/database/schema/schema'
import { eq } from 'drizzle-orm'

export interface DeleteVehicleRequest {
  id: string
}

export class DeleteVehicleUseCase {
  async execute(request: DeleteVehicleRequest) {
    // Supprimer d'abord les sièges liés au véhicule
    await db.delete(seats).where(eq(seats.vehicleId, request.id))
    // Puis supprimer le véhicule
    await db.delete(vehicles).where(eq(vehicles.id, request.id))
    return { success: true }
  }
}
