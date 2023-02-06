import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticationError } from 'apollo-server-errors'
import { contextToUser } from '@core/nest/common/firebaseClient'

export const CurrentUser = createParamDecorator(
  async (_data, context: ExecutionContext) => {
    const user = await contextToUser(context)
    if (user == null) throw new AuthenticationError('Token is invalid')
    return user
  }
)
