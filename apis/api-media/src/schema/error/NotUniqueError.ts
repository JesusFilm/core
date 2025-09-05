import { GraphQLError } from 'graphql'

import { builder } from '../builder'

import { ErrorInterface } from './error'

interface NotUniqueErrorLocation {
  /**
   * An array describing the path in the arguments that caused this error.
   */
  path: string[]
  /**
   * The value that was provided at the path
   */
  value: string
}

export class NotUniqueError extends GraphQLError {
  constructor(
    message: string,
    readonly location: NotUniqueErrorLocation[]
  ) {
    super(message, {
      extensions: {
        code: 'NOT_UNIQUE_ERROR',
        location
      }
    })
    this.name = 'NotUniqueError'
  }
}

const NotUniqueErrorLocationRef = builder
  .objectRef<NotUniqueErrorLocation>('NotUniqueErrorLocation')
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

builder.objectType(NotUniqueError, {
  name: 'NotUniqueError',
  interfaces: [ErrorInterface],
  shareable: true,
  fields: (t) => ({
    location: t.expose('location', {
      type: [NotUniqueErrorLocationRef],
      description: 'The arguments that caused the uniqueness violation'
    })
  })
})
