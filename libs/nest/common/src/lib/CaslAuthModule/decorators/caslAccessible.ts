import { createAccessibleByFactory } from '@casl/prisma/runtime'
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  createParamDecorator
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import isArray from 'lodash/isArray'

const accessibleBy = createAccessibleByFactory()

/**
 * Parameter decorator that provides a CASL `accessibleBy` result for the current user.
 * Requires a string as a paramater that is a Prisma model name. It will provide the
 * Prisma `WhereInput` for the specified subject which can be used within a Prisma query
 * to filter the results.
 * ```ts
 * ＠UseGuards(CaslGuard)
 * async getBlogs(＠CaslAccessible('Blog') accessibleBlogs: Prisma.BlogWhereInput) { ... }
 * async getBlogs(＠CaslAccessible(['Blog', Action.Manage]) accessibleBlogs: Prisma.BlogWhereInput) { ... }
 *
 * ```
 * @see [CASL Prisma docs](https://casl.js.org/v6/en/package/casl-prisma)
 */
export const CaslAccessible = createParamDecorator(
  (data: string | [string, string | undefined], context: ExecutionContext) => {
    if (
      (isArray(data) && typeof data[0] !== 'string') ||
      (!isArray(data) && typeof data !== 'string')
    )
      throw new Error(
        'CaslAccessible decorator requires a subject name for a parameter'
      )

    const req = GqlExecutionContext.create(context).getContext().req

    if (req.ability == null)
      throw new UnauthorizedException('No ability found for request')
    if (req.accessibleWhereInputs == null)
      req.accessibleWhereInputs = accessibleBy(
        req.ability,
        isArray(data) ? data[1] : undefined
      )

    try {
      return req.accessibleWhereInputs[isArray(data) ? data[0] : data]
    } catch (error) {
      throw new ForbiddenException(error)
    }
  }
)
