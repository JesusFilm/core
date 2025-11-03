import { ExecutionContext, Logger, createParamDecorator } from '@nestjs/common'
import { GraphQLError } from 'graphql'

import { contextToUserId } from '@core/nest/common/firebaseClient'

export const CurrentUserId = createParamDecorator(
  (_data, context: ExecutionContext) => {
    const logger = new Logger(CurrentUserId.name)
    const userId = contextToUserId(context, logger)
    if (userId == null)
      throw new GraphQLError('Token is invalid', {
        extensions: { code: 'UNAUTHENTICATED' }
      })
    return userId
  }
)
