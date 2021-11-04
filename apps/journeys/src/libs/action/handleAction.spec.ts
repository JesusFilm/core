import { NextRouter } from 'next/dist/client/router'
import { nextActiveBlock } from '../client/cache/blocks'
import { handleAction } from '.'

jest.mock('../client/cache/blocks', () => {
  const originalModule = jest.requireActual('../client/cache/blocks')
  return {
    __esModule: true,
    ...originalModule,
    nextActiveBlock: jest.fn()
  }
})

describe('handleAction', () => {
  const router = {
    push: jest.fn()
  } as unknown as NextRouter

  it('should handle empty action', () => {
    expect(() => handleAction(router)).not.toThrowError()
  })

  it('should handle NavigateToBlockAction', () => {
    handleAction(router, {
      __typename: 'NavigateToBlockAction',
      blockId: 'block-id',
      gtmEventName: null
    })
    expect(nextActiveBlock).toHaveBeenCalledWith({ id: 'block-id' })
  })

  it('should handle NavigateToJourneyAction', () => {
    handleAction(router, {
      __typename: 'NavigateToJourneyAction',
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        slug: 'journey-slug'
      },
      gtmEventName: null
    })
    expect(router.push).toHaveBeenCalledWith('/journey-slug')
  })

  it('should handle NavigateToJourneyAction when journey is null', () => {
    expect(() =>
      handleAction(router, {
        __typename: 'NavigateToJourneyAction',
        journey: null,
        gtmEventName: null
      })
    ).not.toThrowError()
  })

  it('should handle NavigateAction', () => {
    handleAction(router, {
      __typename: 'NavigateAction',
      gtmEventName: null
    })
    expect(nextActiveBlock).toHaveBeenCalledWith()
  })
})
