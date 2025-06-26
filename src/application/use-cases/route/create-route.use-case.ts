import type { Route } from '../../../domain/models/route.model'
import type { RouteRepository } from '../../../domain/repositories/route.repository.interface'

export class CreateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  execute(input: Omit<Route, 'id'>): Promise<Route> {
    return this.routeRepository.create(input)
  }
}
