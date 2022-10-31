import { createParamDecorator } from '@nestjs/common'
import { get } from 'lodash'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentUserAgent = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  const userAgent = get(ctx.headers, 'user-agent')
  return userAgent
})
