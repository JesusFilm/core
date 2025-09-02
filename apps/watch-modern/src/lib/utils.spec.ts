import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', undefined, 'c')).toBe('a c')
  })
})
