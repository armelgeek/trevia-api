import type { RouteRepository } from '../../../domain/repositories/route.repository.interface'

export class DeleteRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  execute(id: string): Promise<boolean> {
    return this.routeRepository.delete(id)
  }
}
