import { builder } from '../builder'

import { ErrorInterface } from './error'

interface ForeignKeyConstraintErrorLocation {
  /**
   * An array describing the path in the arguments that caused this error.
   */
  path: string[]
  /**
   * The value that was provided at the path
   */
  value: string
}

export class ForeignKeyConstraintError extends Error {
  constructor(
    message: string,
    readonly location: ForeignKeyConstraintErrorLocation[]
  ) {
    super(message)
    this.name = 'ForeignKeyConstraintError'
  }
}

const ForeignKeyConstraintErrorLocationRef = builder
  .objectRef<ForeignKeyConstraintErrorLocation>(
    'ForeignKeyConstraintErrorLocation'
  )
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

builder.objectType(ForeignKeyConstraintError, {
  name: 'ForeignKeyConstraintError',
  interfaces: [ErrorInterface],
  shareable: true,
  fields: (t) => ({
    location: t.expose('location', {
      type: [ForeignKeyConstraintErrorLocationRef],
      description:
        'The arguments that caused the foriegn key constraint violation'
    })
  })
})
