import { conflict, forbidden, notFound } from './errors'

describe('campaign errors', () => {
  it('notFound is NOT_FOUND with the message', () => {
    const error = notFound('campaign not found')
    expect(error.message).toBe('campaign not found')
    expect(error.extensions).toEqual({ code: 'NOT_FOUND' })
  })

  it('forbidden is FORBIDDEN with the message', () => {
    const error = forbidden('user is not allowed to update campaign')
    expect(error.message).toBe('user is not allowed to update campaign')
    expect(error.extensions).toEqual({ code: 'FORBIDDEN' })
  })

  it('forbidden carries the field that named the target, when given', () => {
    const error = forbidden('not yours', 'url')
    expect(error.extensions).toEqual({ code: 'FORBIDDEN', field: 'url' })
  })

  it('conflict is CONFLICT with the message and field', () => {
    const error = conflict('restore the section first', 'id')
    expect(error.message).toBe('restore the section first')
    expect(error.extensions).toEqual({ code: 'CONFLICT', field: 'id' })
  })
})
