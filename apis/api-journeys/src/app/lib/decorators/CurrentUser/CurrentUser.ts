import { ExecutionContext, Logger, createParamDecorator } from '@nestjs/common'
import { GraphQLError } from 'graphql'

import { contextToUser } from '../../firebaseClient'

export const CurrentUser = createParamDecorator(
  (_data, context: ExecutionContext) => {
    const logger = new Logger(CurrentUser.name)
    const user = contextToUser(context, logger)
    if (user == null)
      throw new GraphQLError('Token is invalid', {
        extensions: { code: 'UNAUTHENTICATED' }
      })
    return user
  }
)
