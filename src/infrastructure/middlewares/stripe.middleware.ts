import { stripe } from '../config/stripe.config'
import type { Context, Next } from 'hono'

const addStripe = (c: Context, next: Next) => {
  c.set('stripe', stripe)

  return next()
}

export default addStripe

// fix: trip conflict resolution - Development on 2025-06-01
