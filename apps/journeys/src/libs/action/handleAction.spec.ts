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
      journeyId: 'journey-id',
      gtmEventName: null
    })
    expect(router.push).toHaveBeenCalledWith('/journey-id')
  })

  it('should handle NavigateAction', () => {
    handleAction(router, {
      __typename: 'NavigateAction',
      gtmEventName: null
    })
    expect(nextActiveBlock).toHaveBeenCalledWith()
  })
})
