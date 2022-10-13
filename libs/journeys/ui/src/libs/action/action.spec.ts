import { NextRouter } from 'next/dist/client/router'
import { nextActiveBlock } from '../block'
import { handleAction } from '.'

jest.mock('../block', () => {
  const originalModule = jest.requireActual('../block')
  return {
    __esModule: true,
    ...originalModule,
    nextActiveBlock: jest.fn()
  }
})

describe('action', () => {
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
        parentBlockId: 'parent-id',
        blockId: 'block-id',
        gtmEventName: null
      })
      expect(nextActiveBlock).toHaveBeenCalledWith({ id: 'block-id' })
    })

    it('should handle NavigateToJourneyAction', () => {
      handleAction(router, {
        __typename: 'NavigateToJourneyAction',
        parentBlockId: 'parent-id',
        journey: {
          __typename: 'Journey',
          id: 'journey-id',
          slug: 'journey-slug',
          language: { __typename: 'Language', bcp47: 'en' }
        },
        gtmEventName: null
      })
      expect(router.push).toHaveBeenCalledWith('/journey-slug')
    })

    it('should handle NavigateToJourneyAction when journey is null', () => {
      expect(() =>
        handleAction(router, {
          __typename: 'NavigateToJourneyAction',
          parentBlockId: 'parent-id',
          journey: null,
          gtmEventName: null
        })
      ).not.toThrowError()
    })

    it('should handle NavigateAction', () => {
      handleAction(router, {
        __typename: 'NavigateAction',
        parentBlockId: 'parent-id',
        gtmEventName: null
      })
      expect(nextActiveBlock).toHaveBeenCalledWith()
    })

    it('should handle external LinkAction', () => {
      window.open = jest.fn()

      handleAction(router, {
        __typename: 'LinkAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        url: 'http://www.google.com'
      })
      expect(window.open).toHaveBeenCalledWith(
        'http://www.google.com',
        '_blank'
      )
    })

    it('should handle internal LinkAction', () => {
      handleAction(router, {
        __typename: 'LinkAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        url: 'fact-or-fiction'
      })
      expect(router.push).toHaveBeenCalledWith('fact-or-fiction')
    })
  })
})
