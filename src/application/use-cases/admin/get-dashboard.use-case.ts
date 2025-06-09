import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, trips } from '../../../infrastructure/database/schema/schema'

export interface GetDashboardRequest {
    
}

export interface GetDashboardResponse {
  totalBookings: number
  totalTrips: number
  totalUsers?: number
  alerts: string[]
}

export class GetDashboardUseCase extends IUseCase<GetDashboardRequest, GetDashboardResponse> {
  async execute(): Promise<GetDashboardResponse> {
    const totalBookings = (await db.select().from(bookings)).length
    const totalTrips = (await db.select().from(trips)).length

    const alerts: string[] = []

    if (totalBookings === 0) {
      alerts.push('Aucune réservation enregistrée.')
    }

    if (totalTrips === 0) {
      alerts.push('Aucun voyage planifié.')
    }

    return {
      totalBookings,
      totalTrips,
      alerts
    }
  }

  log(): ActivityType {
    return ActivityType.TEST
  }
}

// feat: add admin user management - Development on 2025-06-09
