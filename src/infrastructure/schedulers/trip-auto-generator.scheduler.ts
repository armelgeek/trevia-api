import * as cron from 'node-cron'
import { autoGenerateTrips } from '../database/auto-generate-trips'

/**
 * Scheduler pour la génération automatique des voyages
 */
class TripScheduler {
  private static instance: TripScheduler
  private tasks: Map<string, cron.ScheduledTask> = new Map()

  private constructor() {}

  static getInstance(): TripScheduler {
    if (!TripScheduler.instance) {
      TripScheduler.instance = new TripScheduler()
    }
    return TripScheduler.instance
  }

  /**
   * Démarre la génération automatique des voyages
   * Par défaut : tous les jours à 00:30
   */
  startAutoGeneration(cronExpression = '30 0 * * *') {
    console.info('🕐 Démarrage du scheduler de génération automatique des voyages')

    const task = cron.schedule(
      cronExpression,
      async () => {
        try {
          console.info('🚀 Début de la génération automatique des voyages...')

          // Générer les voyages pour les 30 prochains jours
          const result = await autoGenerateTrips(30)
          console.info(`✅ Génération terminée: ${result.tripsCreated} voyages, ${result.schedulesCreated} horaires`)

          // Optionnel: nettoyer les anciens voyages (> 7 jours dans le passé)
          this.cleanupOldTrips()
        } catch (error) {
          console.error('❌ Erreur lors de la génération automatique:', error)
        }
      },
      {
        timezone: 'Europe/Paris'
      }
    )

    this.tasks.set('auto-generation', task)
    task.start()

    console.info(`✅ Scheduler configuré: ${cronExpression} (Europe/Paris)`)
  }

  /**
   * Génère immédiatement les voyages pour une période donnée
   */
  async generateNow(daysAhead = 30) {
    console.info(`🚀 Génération immédiate des voyages pour ${daysAhead} jours`)
    return await autoGenerateTrips(daysAhead)
  }

  /**
   * Nettoie les anciens voyages et horaires
   */
  private cleanupOldTrips() {
    // TODO: Implémenter le nettoyage des anciens voyages
    // (supprimer les voyages de plus de 7 jours dans le passé)
    console.info('🧹 Nettoyage des anciens voyages (à implémenter)')
  }

  /**
   * Arrête tous les schedulers
   */
  stopAll() {
    this.tasks.forEach((task, name) => {
      task.stop()
      console.info(`⏹️  Scheduler '${name}' arrêté`)
    })
    this.tasks.clear()
  }

  /**
   * Statut des schedulers
   */
  getStatus() {
    const status = Array.from(this.tasks.entries()).map(([name, task]) => ({
      name,
      running: task.getStatus() === 'scheduled'
    }))

    console.info('📊 Statut des schedulers:', status)
    return status
  }
}

export { TripScheduler }

// feat: implement trip generation service - Development on 2025-05-31

// feat: add trip booking logic - Development on 2025-05-31
