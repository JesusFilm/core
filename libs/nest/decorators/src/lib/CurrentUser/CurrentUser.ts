import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { GraphQLError } from 'graphql'

import { contextToUser } from '@core/nest/common/firebaseClient'

export const CurrentUser = createParamDecorator(
  (_data, context: ExecutionContext) => {
    const user = contextToUser(context)
    if (user == null)
      throw new GraphQLError('Token is invalid', {
        extensions: { code: 'UNAUTHENTICATED' }
      })
    return user
  }
)
