import { createParamDecorator } from '@nestjs/common'
import { get } from 'lodash'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentUserInfo = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  const userAgent = get(ctx.headers, 'user-agent')
  const ipAddress = get(ctx.headers, 'ip-address')
  return { userAgent, ipAddress }
})
