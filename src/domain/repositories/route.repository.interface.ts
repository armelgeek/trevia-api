import type { Route } from '../models/route.model'

export interface RouteRepository {
  findAll: () => Promise<Route[]>
  findById: (id: string) => Promise<Route | null>
  create: (route: Omit<Route, 'id'>) => Promise<Route>
  update: (id: string, route: Partial<Omit<Route, 'id'>>) => Promise<Route | null>
  delete: (id: string) => Promise<boolean>
  // Optionnel : recherche avancée, changement de statut, etc.
}
