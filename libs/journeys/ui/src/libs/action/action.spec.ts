import { NextRouter } from 'next/dist/client/router'

import { ContactActionType } from '../../../__generated__/globalTypes'
import { nextActiveBlock } from '../block'

import { handleAction } from '.'

vi.mock('../block', async () => {
  const originalModule =
    await vi.importActual<typeof import('../block')>('../block')
  return {
    __esModule: true,
    ...originalModule,
    nextActiveBlock: vi.fn()
  }
})

describe('action', () => {
  describe('handleAction', () => {
    const router = {
      push: vi.fn()
    } as unknown as NextRouter

    beforeEach(() => {
      vi.resetAllMocks()
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
      window.open = vi.fn()

      handleAction(router, {
        __typename: 'EmailAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        email: 'edmondshen@gmail.com',
        customizable: false,
        parentStepId: null
      })
      expect(window.open).toHaveBeenCalledWith(
        'mailto:edmondshen@gmail.com',
        '_blank'
      )
    })

    it.skip('should handle PhoneAction call', () => {
      handleAction(router, {
        __typename: 'PhoneAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        phone: '+1234567890',
        countryCode: 'US',
        contactAction: ContactActionType.call,
        customizable: null,
        parentStepId: null
      })
      expect(window.location.href).toBe('tel:+1234567890')
    })

    // TODO: Fix this test
    it.skip('should handle PhoneAction text', () => {
      handleAction(router, {
        __typename: 'PhoneAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        phone: '+1234567890',
        countryCode: 'US',
        contactAction: ContactActionType.text,
        customizable: null,
        parentStepId: null
      })
      expect(window.location.href).toBe('sms:+1234567890')
    })

    it('should handle external LinkAction', () => {
      window.open = vi.fn()

      handleAction(router, {
        __typename: 'LinkAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        url: 'http://www.google.com',
        customizable: false,
        parentStepId: null
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
        url: 'fact-or-fiction',
        customizable: false,
        parentStepId: null
      })
      expect(router.push).toHaveBeenCalledWith('fact-or-fiction')
    })

    it('should not open new tab for internal links to journeys', () => {
      window.open = vi.fn()

      handleAction(router, {
        __typename: 'LinkAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        url: 'https://your.nextstep.is/fact-or-fiction',
        customizable: false,
        parentStepId: null
      })
      expect(router.push).toHaveBeenCalledWith(
        'https://your.nextstep.is/fact-or-fiction'
      )
      expect(window.open).not.toHaveBeenCalled()
    })

    it('should not redirect when url is an empty string', () => {
      window.open = vi.fn()
      handleAction(router, {
        __typename: 'LinkAction',
        parentBlockId: 'parent-id',
        gtmEventName: null,
        url: '',
        customizable: false,
        parentStepId: null
      })
      expect(window.open).not.toHaveBeenCalled()
      expect(router.push).not.toHaveBeenCalled()
    })
  })
})
