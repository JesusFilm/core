import { ZodError, ZodFormattedError } from 'zod'

import { builder } from '../builder'

import { ErrorInterface } from './error'

// Util for flattening zod errors into something easier to represent in your Schema.
function flattenErrors(
  error: ZodFormattedError<unknown>,
  path: string[]
): Array<{ path: string[]; message: string }> {
  const errors = error._errors.map((message) => ({
    path,
    message
  }))

  Object.keys(error).forEach((key) => {
    if (key !== '_errors') {
      errors.push(
        ...flattenErrors(
          (error as Record<string, unknown>)[key] as ZodFormattedError<unknown>,
          [...path, key]
        )
      )
    }
  })

  return errors
}

// A type for the individual validation issues
const ZodFieldError = builder
  .objectRef<{
    message: string
    path: string[]
  }>('ZodFieldError')
  .implement({
    fields: (t) => ({
      message: t.exposeString('message', { nullable: false }),
      path: t.exposeStringList('path', { nullable: false })
    })
  })

// The actual error type
builder.objectType(ZodError, {
  name: 'ZodError',
  interfaces: [ErrorInterface],
  shareable: true,
  fields: (t) => ({
    fieldErrors: t.field({
      type: [ZodFieldError],
      resolve: (err) => flattenErrors(err.format(), []),
      nullable: false
    })
  })
})
