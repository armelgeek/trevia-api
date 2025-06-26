import { randomUUID } from 'node:crypto'
import { eq, and, or } from 'drizzle-orm'
import { db } from '../database/db'
import { routes } from '../database/schema/schema'
import type { Route } from '../../domain/models/route.model'
import type { RouteRepository } from '../../domain/repositories/route.repository.interface'

export class RouteRepositoryImpl implements RouteRepository {
  findAll = async (): Promise<Route[]> => {
    const res = await db.select().from(routes)
    // S'assurer que tous les champs sont string|null (jamais undefined)
    return res.map(r => ({
      ...r,
      departureCity: r.departureCity ?? null,
      arrivalCity: r.arrivalCity ?? null,
      distanceKm: r.distanceKm ?? null,
      duration: r.duration ?? null,
      basePrice: r.basePrice ?? null,
      routeType: r.routeType ?? null,
      status: r.status ?? null
    }))
  }

  findById = async (id: string): Promise<Route | null> => {
    const res = await db.select().from(routes).where(eq(routes.id, id))
    if (!res[0]) return null
    const r = res[0]
    return {
      ...r,
      departureCity: r.departureCity ?? null,
      arrivalCity: r.arrivalCity ?? null,
      distanceKm: r.distanceKm ?? null,
      duration: r.duration ?? null,
      basePrice: r.basePrice ?? null,
      routeType: r.routeType ?? null,
      status: r.status ?? null
    }
  }

  create = async (route: Omit<Route, 'id'>): Promise<Route> => {
    const newRoute = { ...route, id: randomUUID() }
    await db.insert(routes).values(newRoute)
    // On retourne le format normalisé
    return {
      ...newRoute,
      departureCity: newRoute.departureCity ?? null,
      arrivalCity: newRoute.arrivalCity ?? null,
      distanceKm: newRoute.distanceKm ?? null,
      duration: newRoute.duration ?? null,
      basePrice: newRoute.basePrice ?? null,
      routeType: newRoute.routeType ?? null,
      status: newRoute.status ?? null
    }
  }

  update = async (id: string, route: Partial<Omit<Route, 'id'>>): Promise<Route | null> => {
    await db.update(routes).set(route).where(eq(routes.id, id))
    return this.findById(id)
  }

  delete = async (id: string): Promise<boolean> => {
    await db.delete(routes).where(eq(routes.id, id))
    return true
  }

  // Optionnel : recherche avancée (exemple de base)
  // search = async (filters: Partial<Omit<Route, 'id'>>): Promise<Route[]> => {
  //   // À adapter selon les besoins
  //   let query = db.select().from(routes)
  //   // ...ajouter des conditions dynamiquement
  //   return query
  // }
}
