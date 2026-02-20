import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { contextToUser } from '../firebaseClient'

@Injectable()
export class GqlAuthGuard implements CanActivate {
  private readonly logger = new Logger(GqlAuthGuard.name)

  canActivate(context: ExecutionContext): boolean {
    const req = GqlExecutionContext.create(context).getContext().req
    const user = contextToUser(context, this.logger)
    const isAuthenticated = user?.email != null

    req.userId = isAuthenticated ? user.id : null

    return isAuthenticated
  }
}
