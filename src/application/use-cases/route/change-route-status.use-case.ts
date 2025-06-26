import type { Route } from '../../../domain/models/route.model'
import type { RouteRepository } from '../../../domain/repositories/route.repository.interface'

export class ChangeRouteStatusUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  execute(id: string, status: string): Promise<Route | null> {
    return this.routeRepository.update(id, { status })
  }
}
