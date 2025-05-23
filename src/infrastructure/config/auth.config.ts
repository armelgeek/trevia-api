import { env } from 'node:process'
import { betterAuth, type User } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin as adminPlugin, emailOTP, openAPI } from 'better-auth/plugins'
import { Hono } from 'hono'
import { db } from '../database/db'
import {
  emailTemplates,
  sendChangeEmailVerification,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
} from './mail.config'

export const auth = betterAuth({
  plugins: [
    openAPI(),
    emailOTP({
      expiresIn: 300,
      otpLength: 6,
      async sendVerificationOTP({ email, otp }) {
        const template = await emailTemplates.otpLogin(otp)
        await sendEmail({
          to: email,
          ...template
        })
      }
    }),
    adminPlugin()
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true
  }),
  baseURL: env.BETTER_AUTH || 'http://localhost:3000',
  trustedOrigins: [env.BETTER_AUTH || 'http://localhost:3000', env.REACT_APP_URL || 'http://localhost:5173'],
  user: {
    modelName: 'users',
    additionalFields: {
      firstname: { type: 'string', default: '', returned: true },
      lastname: { type: 'string', default: '', returned: true },
      isAdmin: { type: 'boolean', default: false, returned: true },
      role: { type: 'string', default: 'user', returned: true },
      banned: { type: 'boolean', default: false, returned: true },
      banReason: { type: 'string', default: null, returned: true },
      banExpires: { type: 'date', default: null, returned: true },
      isTrialActive: { type: 'boolean', default: false, returned: true },
      trialStartDate: { type: 'date', default: null, returned: true },
      trialEndDate: { type: 'date', default: null, returned: true },
      stripeCustomerId: { type: 'string', default: '', returned: true },
      stripeSubscriptionId: { type: 'string', default: '', returned: true },
      stripePriceId: { type: 'string', default: '', returned: true },
      stripeCurrentPeriodEnd: { type: 'date', default: null, returned: true }
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, token }) => {
        await sendChangeEmailVerification({
          email: newEmail,
          verificationUrl: token
        })
      }
    }
  },
  session: {
    modelName: 'sessions',
    additionalFields: {
      impersonatedBy: { type: 'string', default: null, returned: true }
    }
  },
  account: {
    modelName: 'accounts'
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    requireEmailVerification: false,
    emailVerification: {
      sendVerificationEmail: async ({ user, token }: { user: User; token: string }) => {
        await sendVerificationEmail({
          email: user.email,
          verificationUrl: token
        })
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 3600 // 1 hour
    },
    sendResetPassword: async ({ user, token }) => {
      await sendResetPasswordEmail({
        email: user.email,
        verificationUrl: token
      })
    }
  }
})

const router = new Hono({
  strict: false
})

router.on(['POST', 'GET'], '/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

export default router

// feat: implement user authentication system - 2025-06-21

// test: add authentication tests - 2025-06-21

// feat: add JWT token generation - Development on 2025-05-23
