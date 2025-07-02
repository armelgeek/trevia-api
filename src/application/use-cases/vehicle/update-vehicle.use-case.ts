import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { seats, vehicles } from '../../../infrastructure/database/schema/schema'
import { randomUUID } from 'crypto'

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

function generateSeatLabels(capacity: number): { seatNumber: string }[] {
  // 1A, 2A (avant), puis 1B, 2B, 3B, 4B, 1C, 2C, 3C, 4C, ...
  const seats: { seatNumber: string }[] = []
  if (capacity <= 0) return seats
  if (capacity >= 1) seats.push({ seatNumber: '1A' })
  if (capacity >= 2) seats.push({ seatNumber: '2A' })
  if (capacity <= 2) return seats
  let seatIndex = 3
  let col = 'B'.charCodeAt(0)
  while (seatIndex <= capacity) {
    for (let row = 1; row <= 4 && seatIndex <= capacity; row++) {
      seats.push({ seatNumber: `${row}${String.fromCharCode(col)}` })
      seatIndex++
    }
    col++
  }
  return seats
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

      // Si la capacité a changé, ajuster les sièges
      if (updatedVehicle[0] && typeof seatCount === 'string' && existingVehicle.seatCount !== seatCount) {
        // Supprimer tous les sièges existants
        await db.delete(seats).where(eq(seats.vehicleId, updatedVehicle[0].id))
        // Recréer les sièges selon la nouvelle capacité
        const seatLabels = generateSeatLabels(Number.parseInt(seatCount))
        const seatInserts = seatLabels.map((s) => ({
          id: randomUUID(),
          vehicleId: updatedVehicle[0].id,
          seatNumber: s.seatNumber
        }))
        await db.insert(seats).values(seatInserts)
      }

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

// feat: add vehicle validation - Development on 2025-05-28
