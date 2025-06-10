import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { db } from '../../../infrastructure/database/db/index'
import { trips } from '../../../infrastructure/database/schema/schema'

export interface GetAdminTripsRequest {
  page: number
  limit: number
}

export interface TripSummary {
  tripId: string
  routeId: string
  vehicleId: string
  driverId: string
  departureDate: string | null
  status: string | null
  price: string | null
}

export interface GetAdminTripsResponse {
  data: TripSummary[]
  page: number
  limit: number
  total: number
}

export class GetAdminTripsUseCase extends IUseCase<GetAdminTripsRequest, GetAdminTripsResponse> {
  async execute(request: GetAdminTripsRequest): Promise<GetAdminTripsResponse> {
    const { page, limit } = request
    const offset = (page - 1) * limit

    const allTrips = await db.select().from(trips)
    const paginated = allTrips.slice(offset, offset + limit)

    const data: TripSummary[] = paginated.map((t) => ({
      tripId: t.id,
      routeId: t.routeId ?? '',
      vehicleId: t.vehicleId ?? '',
      driverId: t.driverId ?? '',
      departureDate: t.departureDate ? t.departureDate.toISOString() : null,
      status: t.status ?? null,
      price: t.price ?? null
    }))

    return {
      data,
      page,
      limit,
      total: allTrips.length
    }
  }

  log(): ActivityType {
    return ActivityType.TEST
  }
}

// fix: admin permission checks - Development on 2025-06-10
