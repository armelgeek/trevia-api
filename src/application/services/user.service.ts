import { GetUserByIdUseCase, type GetUserByIdArgs } from '../use-cases/user/get-user-by.use-case'

export class UserService {
  private readonly getUserByIdUseCase: GetUserByIdUseCase

  constructor() {
    this.getUserByIdUseCase = new GetUserByIdUseCase()
  }
  getUserById = (args: GetUserByIdArgs & { currentUserId: string }) => {
    return this.getUserByIdUseCase.run(args)
  }
}

// feat: create user model and repository - 2025-06-21

// feat: implement user CRUD operations - 2025-06-21

// feat: create user controller - Development on 2025-05-25

// perf: optimize database queries - Development on 2025-06-13
