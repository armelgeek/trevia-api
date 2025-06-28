import { boolean, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import type { Action, Subject } from '../../../domain/types/permission.type'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  firstname: text('firstname'),
  lastname: text('lastname'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  role: text('role').notNull().default('user'),
  banned: boolean('banned').notNull().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
})

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  impersonatedBy: text('impersonated_by').references(() => users.id)
})

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
})

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
})

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 })
})

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
})

export const roleResources = pgTable('role_resources', {
  id: text('id').primaryKey(),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type').notNull().$type<Subject>(),
  actions: jsonb('actions').notNull().$type<Action[]>(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
})

export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
})

// ROUTE
export const routes = pgTable('routes', {
  id: text('id').primaryKey(),
  departureCity: text('departure_city').notNull(),
  arrivalCity: text('arrival_city').notNull(),
  distanceKm: text('distance_km'),
  duration: text('duration'),
  basePrice: text('base_price'),
  routeType: text('route_type'),
  status: text('status')
})

// VEHICLE
export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  registration: text('registration').notNull(),
  type: text('type'),
  seatCount: text('seat_count'),
  model: text('model'),
  status: text('status'),
  equipment: text('equipment')
})

// DRIVER
export const drivers = pgTable('drivers', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  license: text('license'),
  certifications: text('certifications'),
  phone: text('phone'),
  status: text('status'),
  reviews: text('reviews')
})

// TRIP
export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  routeId: text('route_id').references(() => routes.id),
  vehicleId: text('vehicle_id').references(() => vehicles.id),
  driverId: text('driver_id').references(() => drivers.id),
  departureDate: timestamp('departure_date'),
  status: text('status'),
  price: text('price'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date())
})

// SCHEDULE
export const schedules = pgTable('schedules', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').references(() => trips.id),
  departureTime: timestamp('departure_time'),
  arrivalTime: timestamp('arrival_time'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// SEAT
export const seats = pgTable('seats', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id),
  seatNumber: text('seat_number'),
  seatType: text('seat_type'),
  row: text('row'),
  col: text('col'),
  extraFee: text('extra_fee'),
  scheduleId: text('schedule_id').references(() => schedules.id)
})

// BOOKING
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  tripId: text('trip_id').references(() => trips.id),
  bookedAt: timestamp('booked_at'),
  status: text('status'),
  totalPrice: text('total_price'),
  seatCount: text('seat_count'),
  paymentIntentId: text('payment_intent_id'), // Ajout du champ pour stocker l'ID de l'intention de paiement
  scheduleId: text('schedule_id').references(() => schedules.id)
})

// PAYMENT
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').references(() => bookings.id),
  amount: text('amount'),
  paymentMethod: text('payment_method'),
  paymentDate: timestamp('payment_date'),
  status: text('status'),
  bankRef: text('bank_ref'),
  paymentIntentId: text('payment_intent_id')
})

// OPTION
export const options = pgTable('options', {
  id: text('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  extraPrice: text('extra_price'),
  optionType: text('option_type')
})

// BOOKING_SEATS (junction table)
export const bookingSeats = pgTable('booking_seats', {
  bookingId: text('booking_id').references(() => bookings.id),
  seatId: text('seat_id').references(() => seats.id),
  seatStatus: text('seat_status')
})

// BOOKING_OPTIONS (junction table)
export const bookingOptions = pgTable('booking_options', {
  bookingId: text('booking_id').references(() => bookings.id),
  optionId: text('option_id').references(() => options.id),
  quantity: text('quantity')
})
