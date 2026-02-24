import { renderHook } from '@testing-library/react'

import {
  buildCustomizeUrl,
  getFirstGuestAllowedScreen
} from '../customizationRoutes'
import type { CustomizationScreen } from '../getCustomizeFlowConfig'

import {
  useHandleTemplateCustomizationRedirect,
  type UseHandleTemplateCustomizationRedirectParams
} from './useHandleTemplateCustomizationRedirect'

const mockReplace = jest.fn()
const mockEnqueueSnackbar = jest.fn()
const mockT = jest.fn((key: string) => key)
const mockOnTemplatesRedirect = jest.fn()

function createParams(
  overrides: Partial<UseHandleTemplateCustomizationRedirectParams> = {}
): UseHandleTemplateCustomizationRedirectParams {
  return {
    router: {
      isReady: true,
      query: { journeyId: 'journey-1', screen: 'language' },
      replace: mockReplace
    } as unknown as UseHandleTemplateCustomizationRedirectParams['router'],
    journeyId: 'journey-1',
    screens: ['language', 'text', 'done'] as CustomizationScreen[],
    activeScreen: 'language' as CustomizationScreen,
    isGuest: false,
    guestFlowEnabled: false,
    onTemplatesRedirect: mockOnTemplatesRedirect,
    enqueueSnackbar: mockEnqueueSnackbar,
    t: mockT,
    ...overrides
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useHandleTemplateCustomizationRedirect', () => {
  describe('screen validation (missing or invalid screen in URL)', () => {
    it('does not redirect when router is not ready', () => {
      renderHook(() =>
        useHandleTemplateCustomizationRedirect(
          createParams({
            router: {
              isReady: false,
              query: {},
              replace: mockReplace
            } as unknown as UseHandleTemplateCustomizationRedirectParams['router']
          })
        )
      )

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('does not redirect when journeyId is empty', () => {
      renderHook(() =>
        useHandleTemplateCustomizationRedirect(
          createParams({ journeyId: '', router: { isReady: true, query: {}, replace: mockReplace } as unknown as UseHandleTemplateCustomizationRedirectParams['router'] })
        )
      )

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('does not redirect when screens is empty', () => {
      renderHook(() =>
        useHandleTemplateCustomizationRedirect(
          createParams({ screens: [] })
        )
      )

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('redirects to first screen when screen query is missing and does not show invalid-step snackbar', () => {
      const params = createParams({
        router: {
          isReady: true,
          query: { journeyId: 'journey-1' },
          replace: mockReplace
        } as unknown as UseHandleTemplateCustomizationRedirectParams['router']
      })

      renderHook(() => useHandleTemplateCustomizationRedirect(params))

      expect(mockReplace).toHaveBeenCalledWith(
        buildCustomizeUrl('journey-1', 'language', undefined, mockOnTemplatesRedirect)
      )
      expect(mockEnqueueSnackbar).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ variant: 'error' })
      )
    })

    it('redirects to first screen when screen query is invalid and shows invalid-step snackbar', () => {
      const params = createParams({
        router: {
          isReady: true,
          query: { journeyId: 'journey-1', screen: 'invalid-screen' },
          replace: mockReplace
        } as unknown as UseHandleTemplateCustomizationRedirectParams['router']
      })

      renderHook(() => useHandleTemplateCustomizationRedirect(params))

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Invalid customization step. You have been redirected to the first step.',
        { variant: 'error', preventDuplicate: true }
      )
      expect(mockReplace).toHaveBeenCalledWith(
        buildCustomizeUrl('journey-1', 'language', undefined, mockOnTemplatesRedirect)
      )
    })

    it('does not redirect when screen is valid', () => {
      const params = createParams({
        router: {
          isReady: true,
          query: { journeyId: 'journey-1', screen: 'text' },
          replace: mockReplace
        } as unknown as UseHandleTemplateCustomizationRedirectParams['router']
      })

      renderHook(() => useHandleTemplateCustomizationRedirect(params))

      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe('guest redirect', () => {
    it('does not redirect when user is not a guest', () => {
      const params = createParams({
        isGuest: false,
        activeScreen: 'social' as CustomizationScreen,
        guestFlowEnabled: true
      })

      renderHook(() => useHandleTemplateCustomizationRedirect(params))

      expect(mockReplace).not.toHaveBeenCalled()
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
    })

    it('does not redirect when router is not ready (guest)', () => {
      const params = createParams({
        isGuest: true,
        guestFlowEnabled: true,
        activeScreen: 'social' as CustomizationScreen,
        router: {
          isReady: false,
          query: {},
          replace: mockReplace
        } as unknown as UseHandleTemplateCustomizationRedirectParams['router']
      })

      renderHook(() => useHandleTemplateCustomizationRedirect(params))

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('redirects guest to first guest-allowed screen when guest flow is disabled', () => {
      const params = createParams({
        isGuest: true,
        guestFlowEnabled: false,
        activeScreen: 'language' as CustomizationScreen
      })

      renderHook(() => useHandleTemplateCustomizationRedirect(params))

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'This step is not available for guests. You have been redirected.',
        { variant: 'error', preventDuplicate: true }
      )
      expect(mockReplace).toHaveBeenCalledWith(
        buildCustomizeUrl(
          'journey-1',
          getFirstGuestAllowedScreen(),
          true,
          mockOnTemplatesRedirect
        )
      )
    })

    it('redirects guest when current screen is not allowed for guests', () => {
      const params = createParams({
        isGuest: true,
        guestFlowEnabled: true,
        activeScreen: 'social' as CustomizationScreen
      })

      renderHook(() => useHandleTemplateCustomizationRedirect(params))

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'This step is not available for guests. You have been redirected.',
        { variant: 'error', preventDuplicate: true }
      )
      expect(mockReplace).toHaveBeenCalledWith(
        buildCustomizeUrl(
          'journey-1',
          getFirstGuestAllowedScreen(),
          true,
          mockOnTemplatesRedirect
        )
      )
    })

    it('does not redirect guest when on allowed screen and guest flow enabled', () => {
      const params = createParams({
        isGuest: true,
        guestFlowEnabled: true,
        activeScreen: 'language' as CustomizationScreen
      })

      renderHook(() => useHandleTemplateCustomizationRedirect(params))

      expect(mockReplace).not.toHaveBeenCalled()
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
    })
  })
})
