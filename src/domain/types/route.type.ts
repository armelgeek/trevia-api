import type { OpenAPIHono } from '@hono/zod-openapi'

export interface Routes {
  controller: OpenAPIHono
  initRoutes: () => void
}

// feat: create route controller - 2025-06-21

// feat: add distance calculation - Development on 2025-05-30
