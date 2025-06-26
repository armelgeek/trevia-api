import type { Route } from '../../../domain/models/route.model'
import type { RouteRepository } from '../../../domain/repositories/route.repository.interface'

export class SearchRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  execute(filters: Partial<Omit<Route, 'id'>>): Promise<Route[]> {
    // À implémenter dans le repository : recherche multi-critères
    // Exemple : return this.routeRepository.search(filters)
    throw new Error('Not implemented')
  }
}
