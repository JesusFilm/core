import { ExecutionContext, Logger, createParamDecorator } from '@nestjs/common'
import { GraphQLError } from 'graphql'

import { contextToUser } from '../../firebaseClient'

export const CurrentUserId = createParamDecorator(
  (_data, context: ExecutionContext) => {
    const logger = new Logger(CurrentUserId.name)
    const user = contextToUser(context, logger)
    if (user == null || user.email == null)
      throw new GraphQLError('Token is invalid', {
        extensions: { code: 'UNAUTHENTICATED' }
      })
    return user.id
  }
)
