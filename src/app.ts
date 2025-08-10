import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { TripGenerationService } from './application/services/trip-generation.service'
import router, { type auth } from './infrastructure/config/auth.config'
import { errorHandler, notFound } from './infrastructure/middlewares/error.middleware'
import { responseMiddleware } from './infrastructure/middlewares/response.middleware'
import addSession from './infrastructure/middlewares/session.middleware'
import sessionValidator from './infrastructure/middlewares/unauthorized-access.middleware'
import { Home } from './infrastructure/pages/home'
import type { Routes } from './domain/types'

export class App {
  private app: OpenAPIHono<{
    Variables: {
      user: typeof auth.$Infer.Session.user | null
      session: typeof auth.$Infer.Session.session | null
    }
  }>
  private tripGenerationService: TripGenerationService

  constructor(routes: Routes[]) {
    this.app = new OpenAPIHono<{
      Variables: {
        user: typeof auth.$Infer.Session.user | null
        session: typeof auth.$Infer.Session.session | null
      }
    }>()

    // Initialiser le service de génération automatique des voyages
    this.tripGenerationService = new TripGenerationService()
    //this.initializeTripGeneration()

    this.initializeGlobalMiddlewares()
    this.initializeRoutes(routes)
    this.initializeSwaggerUI()
    this.initializeRouteFallback()
    this.initializeErrorHandler()
  }
  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      route.initRoutes()
      this.app.route('/api', route.controller)
    })
    this.app.basePath('/api').route('/', router)
    this.app.route('/', Home)
  }

  private initializeGlobalMiddlewares() {
    this.app.use(logger())
    this.app.use(prettyJSON())
    this.app.use(
      '*',
      cors({
        origin:
          Bun.env.NODE_ENV === 'production'
            ? ['https://boiler-hono.ac']
            : [Bun.env.BETTER_AUTH || 'http://localhost:3000', Bun.env.REACT_APP_URL || 'http://localhost:5173'],
        credentials: true,
        maxAge: 86400
      })
    )
    this.app.use('*', responseMiddleware())
    this.app.use(addSession)
    this.app.use(sessionValidator)
  }

  private initializeSwaggerUI() {
    this.app.doc31('/swagger', () => {
      const protocol = Bun.env.NODE_ENV === 'production' ? 'https:' : 'http:'
      const hostname = Bun.env.NODE_ENV === 'production' ? 'boiler-hono.ac' : 'localhost'
      const port = Bun.env.NODE_ENV === 'production' ? '' : ':3000'

      return {
        openapi: '3.1.0',

        info: {
          version: '1.0.0',
          title: 'Boiler Hono API',
          description: `# Introduction 
        \nTrevia API . \n`
        },
        servers: [{ url: `${protocol}//${hostname}${port ? `:${port}` : ''}`, description: 'Current environment' }]
      }
    })

    this.app.get(
      '/docs',
      apiReference({
        pageTitle: 'Boiler Hono API Documentation',
        theme: 'deepSpace',
        isEditable: false,
        layout: 'modern',
        darkMode: true,
        metaData: {
          applicationName: 'Boiler Hono API',
          author: 'Armel Wanes',
          creator: 'Armel Wanes',
          publisher: 'Armel Wanes',
          robots: 'index, follow',
          description: 'Boiler Hono API is ....'
        },
        url: Bun.env.NODE_ENV === 'production' ? 'https://boiler-hono.ac/swagger' : 'http://localhost:3000/swagger'
      })
    )
  }

  private initializeRouteFallback() {
    this.app.notFound((ctx) => {
      return ctx.json({ success: false, message: 'route not found' }, 404)
    })
  }

  private initializeErrorHandler() {
    this.app.notFound(notFound)
    this.app.onError(errorHandler)
  }

  private async initializeTripGeneration() {
    try {
      await this.tripGenerationService.initialize()
      console.info('✅ Service de génération automatique des voyages initialisé')
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation du service de génération:", error)
    }
  }

  public getApp() {
    return this.app
  }
}
