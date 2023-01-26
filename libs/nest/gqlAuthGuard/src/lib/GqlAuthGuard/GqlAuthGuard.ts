import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { contextToUserId } from '@core/nest/common/firebaseClient'

@Injectable()
export class GqlAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = await contextToUserId(context)
    return userId != null
  }
}
