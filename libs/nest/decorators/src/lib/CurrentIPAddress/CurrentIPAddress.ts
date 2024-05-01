import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import get from 'lodash/get'

export const CurrentIPAddress = createParamDecorator(
  (data, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context).getContext()
    return get(ctx.headers, 'x-forwarded-for')
  }
)
