import { Hono } from 'hono'
import { UserService } from '../../application/services/user.service'

const userController = new Hono()
const userService = new UserService()

userController.get('/profile', (ctx) => {
  const userProfile = userService.getUserProfile()
  return ctx.json({ success: true, data: userProfile })
})

export default userController
