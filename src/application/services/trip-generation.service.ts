import { autoGenerateTrips } from '../../infrastructure/database/auto-generate-trips'
import { TripScheduler } from '../../infrastructure/schedulers/trip-auto-generator.scheduler'

/**
 * Service de gestion automatique des voyages
 */
class TripGenerationService {
  private scheduler: TripScheduler

  constructor() {
    this.scheduler = TripScheduler.getInstance()
  }

  /**
   * Initialise le système de génération automatique
   */
  async initialize() {
    console.info('🚀 Initialisation du service de génération automatique des voyages')

    // Générer immédiatement les voyages pour les 30 prochains jours si nécessaire
    await this.generateInitialTrips()

    // Démarrer le scheduler automatique
    this.startScheduler()
  }

  /**
   * Génère les voyages initiaux si la base est vide
   */
  private async generateInitialTrips() {
    try {
      console.info('🔍 Vérification des voyages existants...')
      const result = await autoGenerateTrips(30)

      if (result.tripsCreated > 0) {
        console.info(`✅ ${result.tripsCreated} voyages générés lors de l'initialisation`)
      } else {
        console.info('ℹ️  Aucun nouveau voyage à générer')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la génération initiale:', error)
    }
  }

  /**
   * Démarre le scheduler automatique
   */
  private startScheduler() {
    // Génération quotidienne à 00:30
    this.scheduler.startAutoGeneration('30 0 * * *')

    // Optionnel: Génération supplémentaire le dimanche à 12:00 pour la semaine suivante
    // this.scheduler.startAutoGeneration('0 12 * * 0')
  }

  /**
   * Génère manuellement les voyages
   */
  async generateManually(daysAhead = 30) {
    return await this.scheduler.generateNow(daysAhead)
  }

  /**
   * Arrête tous les schedulers
   */
  stop() {
    this.scheduler.stopAll()
  }

  /**
   * Statut du service
   */
  getStatus() {
    return this.scheduler.getStatus()
  }
}

export { TripGenerationService }
