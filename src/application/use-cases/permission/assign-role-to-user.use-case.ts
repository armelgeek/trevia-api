import { IUseCase } from '@/domain/types'
import { ActivityType } from '@/infrastructure/config/activity.config'
import type { PermissionService } from '@/application/services/permission.service'

interface AssignRoleToUserUseCaseParams {
  userId: string
  roleId: string
}

export class AssignRoleToUserUseCase extends IUseCase<AssignRoleToUserUseCaseParams, void> {
  constructor(private permissionService: PermissionService) {
    super()
  }

  async execute({ userId, roleId }: AssignRoleToUserUseCaseParams): Promise<void> {
    await this.permissionService.assignRoleToUser(userId, roleId)
  }

  log(): ActivityType {
    return ActivityType.ASSIGN_ROLE
  }
}
// feat: add user validation - 2025-06-21

// feat: create permission service - Development on 2025-05-26
