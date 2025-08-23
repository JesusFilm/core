import { Block } from '@core/prisma/journeys/client'

import { canBlockHaveAction } from './canBlockHaveAction'

describe('canBlockHaveAction', () => {
  it('should return true for sign up block', () => {
    expect(
      canBlockHaveAction({ typename: 'SignUpBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for radio option block', () => {
    expect(
      canBlockHaveAction({ typename: 'RadioOptionBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for button block', () => {
    expect(
      canBlockHaveAction({ typename: 'ButtonBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for video block', () => {
    expect(
      canBlockHaveAction({ typename: 'VideoBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true for video trigger block', () => {
    expect(
      canBlockHaveAction({ typename: 'VideoTriggerBlock' } as unknown as Block)
    ).toBe(true)
  })

  it('should return true if block is not supported', () => {
    expect(
      canBlockHaveAction({ typename: 'TypographyBlock' } as unknown as Block)
    ).toBe(false)
  })
})
