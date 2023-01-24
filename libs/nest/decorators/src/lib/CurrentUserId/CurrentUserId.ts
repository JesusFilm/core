import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticationError } from 'apollo-server-errors'
import { contextToUserId } from '@core/nest/common/firebaseClient'

export const CurrentUserId = createParamDecorator(
  async (_data, context: ExecutionContext) => {
    const userId = await contextToUserId(context)
    if (userId == null) throw new AuthenticationError('Token is invalid')
    return userId
  }
)
