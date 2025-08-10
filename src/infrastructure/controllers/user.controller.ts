import { Hono } from 'hono'
import { UserService } from '../../application/services/user.service'

const userController = new Hono()

userController.get('/profile', (ctx) => {
  return ctx.json({ success: true, data: null })
})

export default userController
