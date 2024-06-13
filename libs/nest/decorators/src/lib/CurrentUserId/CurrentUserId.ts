import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { GraphQLError } from 'graphql'

import { contextToUserId } from '@core/nest/common/firebaseClient'

export const CurrentUserId = createParamDecorator(
  async (_data, context: ExecutionContext) => {
    const userId = await contextToUserId(context)
    if (userId == null)
      throw new GraphQLError('Token is invalid', {
        extensions: { code: 'UNAUTHENTICATED' }
      })
    return userId
  }
)
