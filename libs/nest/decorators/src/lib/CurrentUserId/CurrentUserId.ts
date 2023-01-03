import { createParamDecorator } from '@nestjs/common'
import { get } from 'lodash'
import { GqlExecutionContext } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

export const CurrentUserId = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  const userId = get(ctx.headers, 'user-id')
  if (userId == null)
    throw new GraphQLError('No user id provided', {
      extensions: { code: 'UNAUTHENTICATED' }
    })
  return userId
})
