import { builder } from '../builder'

import { ErrorInterface } from './error'

interface NotFoundErrorLocation {
  /**
   * An array describing the path in the arguments that caused this error.
   */
  path: string[]
  /**
   * The value that was provided at the path
   */
  value: string
}

export class NotFoundError extends Error {
  constructor(
    message: string,
    readonly location: NotFoundErrorLocation[]
  ) {
    super(message)
    this.name = 'NotFoundError'
  }
}

const NotFoundErrorLocationRef = builder
  .objectRef<NotFoundErrorLocation>('NotFoundErrorLocation')
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

builder.objectType(NotFoundError, {
  name: 'NotFoundError',
  interfaces: [ErrorInterface],
  shareable: true,
  fields: (t) => ({
    location: t.expose('location', {
      type: [NotFoundErrorLocationRef],
      description: 'The arguments that caused the not found error'
    })
  })
})
