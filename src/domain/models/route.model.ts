export interface Route {
  id: string
  departureCity: string
  arrivalCity: string
  distanceKm?: string | null
  duration?: string | null
  basePrice?: string | null
  routeType?: string | null
  status?: string | null
}
