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

    beforeEach(() => {
      jest.resetAllMocks()
    })

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

    it('should handle PhoneAction', () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          href: ''
        },
        writable: true
      })

      handleAction(router, {
        __typename: 'PhoneAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        phone: '1234567890'
      })
      expect(window.location.href).toBe('tel:1234567890')
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

    it('should not redirect when url is an empty string', () => {
      window.open = jest.fn()
      handleAction(router, {
        __typename: 'LinkAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        url: ''
      })
      expect(window.open).not.toHaveBeenCalled()
      expect(router.push).not.toHaveBeenCalled()
    })
  })
})
