import { GraphQLError } from 'graphql'

import { builder } from '../builder'

import { ErrorInterface } from './error'

interface ForbiddenErrorLocation {
  /**
   * An array describing the path in the arguments that caused this error.
   */
  path: string[]
  /**
   * The value that was provided at the path
   */
  value: string
}

export class ForbiddenError extends GraphQLError {
  constructor(
    message: string,
    readonly location: ForbiddenErrorLocation[]
  ) {
    super(message, {
      extensions: {
        code: 'FORBIDDEN_ERROR',
        location
      }
    })
    this.name = 'ForbiddenError'
  }
}

const ForbiddenErrorLocationRef = builder
  .objectRef<ForbiddenErrorLocation>('ForbiddenErrorLocation')
  .implement({
    fields: (t) => ({
      path: t.exposeStringList('path', {
        description:
          'An array describing the path in the arguments that caused this error'
      }),
      value: t.exposeString('value', {
        description: 'The value that was provided at the path'
      })
    })
  })

builder.objectType(ForbiddenError, {
  name: 'ForbiddenError',
  interfaces: [ErrorInterface],
  shareable: true,
  fields: (t) => ({
    location: t.expose('location', {
      type: [ForbiddenErrorLocationRef],
      description: 'The arguments that caused the forbidden error'
    })
  })
})
