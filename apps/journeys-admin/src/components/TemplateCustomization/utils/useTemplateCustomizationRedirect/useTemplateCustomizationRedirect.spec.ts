import { renderHook } from '@testing-library/react'

import {
  buildCustomizeUrl,
  getFirstGuestAllowedScreen
} from '../customizationRoutes'
import type { CustomizationScreen } from '../getCustomizeFlowConfig'

import {
  type UseTemplateCustomizationRedirectParams,
  useTemplateCustomizationRedirect
} from './useTemplateCustomizationRedirect'

const mockReplace = jest.fn()
const mockEnqueueSnackbar = jest.fn()
const mockT = jest.fn((key: string) => key)

const defaultRouter = {
  isReady: true,
  query: { journeyId: 'journey-1', screen: 'language' },
  replace: mockReplace
}

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: mockT })
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

const mockUseRouter = jest.requireMock('next/router').useRouter as jest.Mock

function createParams(
  overrides: Partial<UseTemplateCustomizationRedirectParams> = {}
): UseTemplateCustomizationRedirectParams {
  return {
    journeyId: 'journey-1',
    screens: ['language', 'text', 'done'] as CustomizationScreen[],
    activeScreen: 'language' as CustomizationScreen,
    isGuest: false,
    guestFlowEnabled: false,
    ...overrides
  }
}

describe('useTemplateCustomizationRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockImplementation(() => defaultRouter)
  })

  describe('screen validation (missing or invalid screen in URL)', () => {
    it('does not redirect when router is not ready', () => {
      mockUseRouter.mockReturnValue({
        isReady: false,
        query: {},
        replace: mockReplace
      })

      renderHook(() => useTemplateCustomizationRedirect(createParams()))

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('does not redirect when journeyId is empty', () => {
      mockUseRouter.mockReturnValue({
        isReady: true,
        query: {},
        replace: mockReplace
      })

      renderHook(() =>
        useTemplateCustomizationRedirect(createParams({ journeyId: '' }))
      )

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('does not redirect when screens is empty', () => {
      renderHook(() =>
        useTemplateCustomizationRedirect(createParams({ screens: [] }))
      )

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('redirects to first screen when screen query is missing and does not show invalid-step snackbar', () => {
      mockUseRouter.mockReturnValue({
        isReady: true,
        query: { journeyId: 'journey-1' },
        replace: mockReplace
      })

      renderHook(() => useTemplateCustomizationRedirect(createParams()))

      expect(mockReplace).toHaveBeenCalledWith(
        buildCustomizeUrl('journey-1', 'language', undefined)
      )
      expect(mockEnqueueSnackbar).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ variant: 'error' })
      )
    })

    it('redirects to first screen when screen query is invalid and shows invalid-step snackbar', () => {
      mockUseRouter.mockReturnValue({
        isReady: true,
        query: { journeyId: 'journey-1', screen: 'invalid-screen' },
        replace: mockReplace
      })

      renderHook(() => useTemplateCustomizationRedirect(createParams()))

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Invalid customization step. You have been redirected to the first step.',
        { variant: 'error', preventDuplicate: true }
      )
      expect(mockReplace).toHaveBeenCalledWith(
        buildCustomizeUrl('journey-1', 'language', undefined)
      )
    })

    it('does not redirect when screen is valid', () => {
      renderHook(() => useTemplateCustomizationRedirect(createParams()))

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

      renderHook(() => useTemplateCustomizationRedirect(params))

      expect(mockReplace).not.toHaveBeenCalled()
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
    })

    it('does not redirect when router is not ready (guest)', () => {
      mockUseRouter.mockReturnValue({
        isReady: false,
        query: {},
        replace: mockReplace
      })

      renderHook(() =>
        useTemplateCustomizationRedirect(
          createParams({
            isGuest: true,
            guestFlowEnabled: true,
            activeScreen: 'social' as CustomizationScreen
          })
        )
      )

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('redirects guest to first guest-allowed screen when guest flow is disabled', () => {
      const params = createParams({
        isGuest: true,
        guestFlowEnabled: false,
        activeScreen: 'language' as CustomizationScreen
      })

      renderHook(() => useTemplateCustomizationRedirect(params))

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'This template cannot be customised by a guest.',
        { variant: 'error', preventDuplicate: true }
      )
      expect(mockReplace).toHaveBeenCalledWith(
        buildCustomizeUrl('journey-1', getFirstGuestAllowedScreen(), true)
      )
    })

    it('redirects guest to links screen when current screen is not allowed for guests', () => {
      const params = createParams({
        isGuest: true,
        guestFlowEnabled: true,
        activeScreen: 'social' as CustomizationScreen
      })

      renderHook(() => useTemplateCustomizationRedirect(params))

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "The step you're trying to access is not available to guests. Please sign up.",
        { variant: 'error', preventDuplicate: true }
      )
      expect(mockReplace).toHaveBeenCalledWith(
        buildCustomizeUrl(
          'journey-1',
          'guestPreview' as CustomizationScreen,
          true
        )
      )
    })

    it('does not redirect guest when on allowed screen and guest flow enabled', () => {
      const params = createParams({
        isGuest: true,
        guestFlowEnabled: true,
        activeScreen: 'language' as CustomizationScreen
      })

      renderHook(() => useTemplateCustomizationRedirect(params))

      expect(mockReplace).not.toHaveBeenCalled()
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
    })
  })
})
