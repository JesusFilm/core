import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticationError } from 'apollo-server-errors'
import { contextToEmail } from '@core/nest/common/firebaseClient'

export const CurrentEmail = createParamDecorator(
  async (_data, context: ExecutionContext) => {
    const email = await contextToEmail(context)
    if (email == null) throw new AuthenticationError('Token is invalid')
    return email
  }
)
