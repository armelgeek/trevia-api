export interface Driver {
  id: string
  firstName: string
  lastName: string
  /**
   * Nom complet du conducteur (calculé dynamiquement)
   */
  readonly fullName?: string
  license?: string | null
  certifications?: string | null
  phone?: string | null
  status?: string | null
  reviews?: string | null
}
