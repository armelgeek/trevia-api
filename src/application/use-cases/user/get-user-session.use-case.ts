import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'

export interface GetUserSessionRequest {
  user: any
}

export interface GetUserSessionResponse {
  success: boolean
  data: {
    user: any
  }
}

export class GetUserSessionUseCase extends IUseCase<GetUserSessionRequest, GetUserSessionResponse> {
  execute(request: GetUserSessionRequest): Promise<GetUserSessionResponse> {
    const { user } = request

    if (!user) {
      throw new Error('Unauthorized')
    }

    return Promise.resolve({
      success: true,
      data: { user }
    })
  }

  log(): ActivityType {
    return ActivityType.SIGN_IN
  }
}

// feat: implement reservation logic - Development on 2025-06-04
