import { createParamDecorator } from '@nestjs/common'
import { get } from 'lodash'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthenticationError } from 'apollo-server-errors'

export const CurrentUserId = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  const userId = get(ctx.headers, 'user-id')
  if (userId == null) throw new AuthenticationError('No user id provided')
  return userId
})
