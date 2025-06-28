import { App } from './app'
import {
  AdminController,
  BookingController,
  OptionController,
  PaymentController,
  PermissionController,
  PricingController,
  RouteController,
  TripController,
  VehicleController
} from './infrastructure/controllers'
import { DriverController } from './infrastructure/controllers/driver.controller'
import { LocationController } from './infrastructure/controllers/location.controller'
import { ReservationController } from './infrastructure/controllers/reservation.controller'
import { ScheduleController } from './infrastructure/controllers/schedule.controller'
import { WebhookController } from './infrastructure/controllers/webhook.controller'

const app = new App([
  new PermissionController(),
  new RouteController(),
  new TripController(),
  new BookingController(),
  new PaymentController(),
  new VehicleController(),
  new OptionController(),
  new AdminController(),
  new PricingController(),
  new ReservationController(),
  new WebhookController(),
  new LocationController(),
  new DriverController(),
  new ScheduleController()
]).getApp()

const PORT = Bun.env.PORT || 3000

console.info(`
\u001B[34m╔══════════════════════════════════════════════════════╗
║               \u001B[1mBOILER HONO API\u001B[0m\u001B[34m                ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  \u001B[0m🚀 Server started successfully                   \u001B[34m║
║  \u001B[0m📡 Listening on: \u001B[36mhttp://localhost:${PORT}\u001B[34m        ║
║  \u001B[0m📚 API Docs: \u001B[36mhttp://localhost:${PORT}/docs\u001B[34m    ║
║  \u001B[0m📚 Auth Docs: \u001B[36mhttp://localhost:${PORT}/api/auth/reference\u001B[34m  ║
║                                                      ║
╚══════════════════════════════════════════════════════╝\u001B[0m
`)

export default app
