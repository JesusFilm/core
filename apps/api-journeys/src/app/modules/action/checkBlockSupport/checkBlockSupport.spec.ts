import { Block } from '.prisma/api-journeys-client'

import { checkBlockSupport } from './checkBlockSupport'

describe('checkBlockSupport', () => {
  it('should return true for sign up block', () => {
    expect(
      checkBlockSupport({ typename: 'SignUpBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for radio option block', () => {
    expect(
      checkBlockSupport({ typename: 'RadioOptionBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for button block', () => {
    expect(
      checkBlockSupport({ typename: 'ButtonBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for video block', () => {
    expect(
      checkBlockSupport({ typename: 'VideoTriggerBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for video trigger block', () => {
    expect(
      checkBlockSupport({ typename: 'TextResponseBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for text response block', () => {
    expect(
      checkBlockSupport({ typename: 'TextResponseBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for form block', () => {
    expect(
      checkBlockSupport({ typename: 'TextResponseBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true if block is not supported', () => {
    expect(
      checkBlockSupport({ typename: 'TypographyBlock' } as unknown as Block)
    ).toBe(false)
  })
})
