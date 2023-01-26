import { createParamDecorator } from '@nestjs/common'
import { get } from 'lodash'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentIPAddress = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  return get(ctx.headers, 'x-forwarded-for')
})
