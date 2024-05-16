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
      expect(() => handleAction(router)).not.toThrow()
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

    it('should handle EmailAction', () => {
      window.open = jest.fn()

      handleAction(router, {
        __typename: 'EmailAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        email: 'edmondshen@gmail.com'
      })
      expect(window.open).toHaveBeenCalledWith(
        'mailto:edmondshen@gmail.com',
        '_blank'
      )
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

    it('should handle internal LinkAction for non http url', () => {
      handleAction(router, {
        __typename: 'LinkAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        url: 'fact-or-fiction'
      })
      expect(router.push).toHaveBeenCalledWith('fact-or-fiction')
    })

    it('should not open new tab for internal links to journeys', () => {
      window.open = jest.fn()

      handleAction(router, {
        __typename: 'LinkAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        url: 'https://your.nextstep.is/fact-or-fiction'
      })
      expect(router.push).toHaveBeenCalledWith(
        'https://your.nextstep.is/fact-or-fiction'
      )
      expect(window.open).not.toHaveBeenCalled()
    })
  })
})
