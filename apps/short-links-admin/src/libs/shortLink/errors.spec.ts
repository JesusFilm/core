import { isMutationError, parseMutationError } from './errors'

describe('parseMutationError', () => {
  it('puts a claimed global pathname on the pathname field', () => {
    const result = {
      __typename: 'NotUniqueError' as const,
      message: 'global pathname already claimed by another link',
      location: [{ path: ['input', 'pathname'], value: 'jesus' }]
    }

    expect(isMutationError(result)).toBe(true)
    expect(parseMutationError(result)).toEqual({
      message: 'global pathname already claimed by another link',
      fieldErrors: {
        pathname: 'global pathname already claimed by another link'
      }
    })
  })

  it('maps zod field errors by their last path segment', () => {
    expect(
      parseMutationError({
        __typename: 'ZodError',
        message: 'Invalid input',
        fieldErrors: [
          {
            path: ['input', 'global'],
            message: 'Global slugs must be lower-case'
          }
        ]
      })
    ).toEqual({
      message: 'Invalid input',
      fieldErrors: { global: 'Global slugs must be lower-case' }
    })
  })
})
