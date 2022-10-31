import { createParamDecorator } from '@nestjs/common'
import { get } from 'lodash'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentIPAddress = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  const ipAddress = get(ctx.headers, 'X-Forwarded-For')
  return ipAddress
})
