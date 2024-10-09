import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { contextToUserId } from '@core/nest/common/firebaseClient'

@Injectable()
export class GqlAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = GqlExecutionContext.create(context).getContext().req
    const userId = contextToUserId(context)
    req.userId = userId
    return userId != null
  }
}
