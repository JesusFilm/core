import { createParamDecorator } from '@nestjs/common'
import get from 'lodash/get'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentUserAgent = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  return get(ctx.headers, 'user-agent')
})
