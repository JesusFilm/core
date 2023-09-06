import { createParamDecorator } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import get from 'lodash/get'

export const CurrentUserAgent = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  return get(ctx.headers, 'user-agent')
})
