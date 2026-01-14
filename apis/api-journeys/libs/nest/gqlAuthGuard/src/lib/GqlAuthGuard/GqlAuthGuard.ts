import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { contextToUserId } from '@core/nest/common/firebaseClient'

@Injectable()
export class GqlAuthGuard implements CanActivate {
  private readonly logger = new Logger(GqlAuthGuard.name)

  canActivate(context: ExecutionContext): boolean {
    const req = GqlExecutionContext.create(context).getContext().req
    const userId = contextToUserId(context, this.logger)
    req.userId = userId
    return userId != null
  }
}
