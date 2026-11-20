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

    // jsdom cannot navigate, so assert on a swapped-in location object. The
    // window property itself is configurable, which is what makes this work.
    const originalLocationDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'location'
    )

    beforeEach(() => {
      vi.resetAllMocks()

      Object.defineProperty(window, 'location', {
        configurable: true,
        enumerable: false,
        value: { ...window.location, href: '', reload: vi.fn() }
      })
    })

    afterEach(() => {
      if (originalLocationDescriptor != null) {
        Object.defineProperty(window, 'location', originalLocationDescriptor)
      }
    })

    it('should handle empty action', () => {
      expect(() => handleAction(router)).not.toThrow()
    })

    it.each([
      { __typename: 'LinkAction', url: 'https://example.com' },
      { __typename: 'EmailAction', email: 'synthetic@example.com' },
      { __typename: 'ChatAction', chatUrl: 'https://example.com/chat' },
      {
        __typename: 'PhoneAction',
        phone: '+15555550123',
        countryCode: 'US',
        contactAction: ContactActionType.call
      }
    ] as const)(
      'suppresses $.__typename external actions during private playback',
      (action) => {
        window.open = vi.fn()
        handleAction(
          router,
          {
            parentBlockId: 'button',
            gtmEventName: null,
            customizable: false,
            parentStepId: null,
            ...action
          },
          undefined,
          'preview'
        )
        expect(window.open).not.toHaveBeenCalled()
        expect(window.location.href).toBe('')
        expect(router.push).not.toHaveBeenCalled()
      }
    )

    it('routes private website answers within the same authenticated Admin page', () => {
      const replace = vi.fn()
      const privateRouter = {
        ...router,
        pathname: '/journeys/[journeyId]/preview',
        query: { journeyId: 'saved' },
        replace
      }
      handleAction(
        privateRouter,
        {
          __typename: 'NavigateToBlockAction',
          parentBlockId: 'answer',
          gtmEventName: null,
          blockId: 'answer-step'
        },
        '/public/answer',
        'preview'
      )
      expect(nextActiveBlock).toHaveBeenCalledWith({ id: 'answer-step' })
      expect(replace).toHaveBeenCalledWith(
        {
          pathname: '/journeys/[journeyId]/preview',
          query: { journeyId: 'saved', stepId: 'answer-step' }
        },
        undefined,
        { shallow: true }
      )
      expect(router.push).not.toHaveBeenCalled()
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
      expect(window.location.href).toBe('mailto:edmondshen@gmail.com')
      // A popup would be blocked on iOS Safari and stranded on Android Chrome.
      expect(window.open).not.toHaveBeenCalled()
    })

    it('should handle PhoneAction call', () => {
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

    it('should handle PhoneAction text', () => {
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
