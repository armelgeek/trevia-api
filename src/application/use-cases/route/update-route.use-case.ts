import type { Route } from '../../../domain/models/route.model'
import type { RouteRepository } from '../../../domain/repositories/route.repository.interface'

export class UpdateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  execute(id: string, input: Partial<Omit<Route, 'id'>>): Promise<Route | null> {
    return this.routeRepository.update(id, input)
  }
}
