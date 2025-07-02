import { db } from '../../../infrastructure/database/db/index'
import { vehicles, seats } from '../../../infrastructure/database/schema/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

interface CreateVehicleInput {
  registration: string
  type?: string
  seatCount?: string
  model?: string
  status?: string
  equipment?: string
  capacity: number
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

function generateSeatLabels(capacity: number): { seatNumber: string }[] {
  // 1A, 2A (avant), puis 1B, 2B, 3B, 4B, 1C, 2C, 3C, 4C, ...
  const seats: { seatNumber: string }[] = []
  if (capacity <= 0) return seats
  // 1A et 2A (avant, côté conducteur)
  if (capacity >= 1) seats.push({ seatNumber: '1A' })
  if (capacity >= 2) seats.push({ seatNumber: '2A' })
  if (capacity <= 2) return seats
  // Pour le reste, 4 rangées max par lettre (B, C, D, ...)
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

export class CreateVehicleUseCase {
  public async execute(input: CreateVehicleInput): Promise<CreateVehicleOutput> {
    const { registration, type, seatCount, model, status, equipment } = input

    try {
      const vehicleId = randomUUID()
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

      // Créer les sièges selon la capacité et le schéma alphabétique
      const capacity = Number.parseInt(seatCount ?? '0') || 0
      console.log('Création des sièges pour le véhicule:', newVehicle[0].id, 'avec capacité:', capacity)
      if (newVehicle[0] && capacity > 0) {
        const seatLabels = generateSeatLabels(capacity)
        const seatInserts = seatLabels.map((s) => ({
          id: randomUUID(),
          vehicleId: newVehicle[0].id,
          seatNumber: s.seatNumber
        }))
        await db.insert(seats).values(seatInserts)
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
