import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import get from 'lodash/get'

export const CurrentUserAgent = createParamDecorator(
  (data, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context).getContext()
    return get(ctx.headers, 'user-agent')
  }
)
