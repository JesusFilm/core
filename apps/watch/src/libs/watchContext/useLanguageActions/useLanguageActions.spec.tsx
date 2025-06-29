import { act, renderHook } from '@testing-library/react'
import { NextRouter } from 'next/router'
import { ReactNode } from 'react'

import { setCookie } from '../../cookieHandler'
import { WatchInitialState, WatchProvider, useWatch } from '../WatchContext'

import { useLanguageActions } from './useLanguageActions'

// Mock the dependencies
jest.mock('../../cookieHandler', () => ({
  setCookie: jest.fn()
}))

const mockSetCookie = setCookie as jest.MockedFunction<typeof setCookie>

describe('useLanguageActions', () => {
  const mockReload = jest.fn()
  const mockRouter = { reload: mockReload } as unknown as NextRouter

  const defaultInitialState: WatchInitialState = {
    siteLanguage: 'en',
    audioLanguage: '529',
    subtitleLanguage: '529',
    subtitleOn: false
  }

  const mockAllLanguages = [
    {
      id: '529',
      bcp47: 'en',
      __typename: 'Language' as const,
      slug: 'english',
      name: [
        { primary: true, value: 'English', __typename: 'LanguageName' as const }
      ]
    },
    {
      id: '530',
      bcp47: 'es',
      __typename: 'Language' as const,
      slug: 'spanish',
      name: [
        { primary: true, value: 'Spanish', __typename: 'LanguageName' as const }
      ]
    },
    {
      id: '531',
      bcp47: 'fr',
      __typename: 'Language' as const,
      slug: 'french',
      name: [
        { primary: true, value: 'French', __typename: 'LanguageName' as const }
      ]
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateSiteLanguage', () => {
    it('should set cookies when language exists in allLanguages', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider initialState={defaultInitialState}>
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(
        () => {
          const { dispatch } = useWatch()
          const actions = useLanguageActions()
          return { dispatch, actions }
        },
        { wrapper }
      )

      // Set up the state after render using act
      await act(async () => {
        result.current.dispatch({
          type: 'SetAllLanguages',
          allLanguages: mockAllLanguages
        })
        result.current.dispatch({ type: 'SetRouter', router: mockRouter })
      })

      // Now test the action
      act(() => {
        result.current.actions.updateSiteLanguage('es')
      })

      expect(mockSetCookie).toHaveBeenCalledWith('NEXT_LOCALE', 'es')
      expect(mockSetCookie).toHaveBeenCalledWith('AUDIO_LANGUAGE', '530')
      expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLE_LANGUAGE', '530')
      expect(mockSetCookie).toHaveBeenCalledTimes(3)
    })

    it('should fallback to current language IDs when selected language not found', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider initialState={defaultInitialState}>
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(
        () => {
          const { dispatch } = useWatch()
          const actions = useLanguageActions()
          return { dispatch, actions }
        },
        { wrapper }
      )

      // Set up the state after render using act
      await act(async () => {
        result.current.dispatch({
          type: 'SetAllLanguages',
          allLanguages: mockAllLanguages
        })
        result.current.dispatch({ type: 'SetRouter', router: mockRouter })
      })

      // Test with language not in allLanguages
      act(() => {
        result.current.actions.updateSiteLanguage('de')
      })

      expect(mockSetCookie).toHaveBeenCalledWith('NEXT_LOCALE', 'de')
      expect(mockSetCookie).toHaveBeenCalledWith('AUDIO_LANGUAGE', '529') // fallback to current
      expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLE_LANGUAGE', '529') // fallback to current
    })

    it('should trigger router reload', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider initialState={defaultInitialState}>
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(
        () => {
          const { dispatch } = useWatch()
          const actions = useLanguageActions()
          return { dispatch, actions }
        },
        { wrapper }
      )

      // Set up the state after render using act
      await act(async () => {
        result.current.dispatch({ type: 'SetRouter', router: mockRouter })
      })

      const callCountBefore = mockReload.mock.calls.length

      act(() => {
        result.current.actions.updateSiteLanguage('es')
      })

      // Give a moment for setTimeout to execute
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(mockReload.mock.calls.length).toBe(callCountBefore + 1)
    })

    it('should not trigger reload when router is not available', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider initialState={defaultInitialState}>
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      act(() => {
        result.current.updateSiteLanguage('es')
      })

      expect(mockReload).not.toHaveBeenCalled()
    })

    it('should handle missing allLanguages gracefully', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider initialState={defaultInitialState}>
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(
        () => {
          const { dispatch } = useWatch()
          const actions = useLanguageActions()
          return { dispatch, actions }
        },
        { wrapper }
      )

      // Set up router but no allLanguages
      await act(async () => {
        result.current.dispatch({ type: 'SetRouter', router: mockRouter })
      })

      act(() => {
        result.current.actions.updateSiteLanguage('es')
      })

      expect(mockSetCookie).toHaveBeenCalledWith('NEXT_LOCALE', 'es')
      expect(mockSetCookie).toHaveBeenCalledWith('AUDIO_LANGUAGE', '529')
      expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLE_LANGUAGE', '529')
    })
  })

  it('should set audio and subtitle language cookies', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WatchProvider initialState={defaultInitialState}>
        {children}
      </WatchProvider>
    )

    const { result } = renderHook(
      () => {
        const { dispatch } = useWatch()
        const actions = useLanguageActions()
        return { dispatch, actions }
      },
      { wrapper }
    )

    // Set up the state after render using act
    await act(async () => {
      result.current.dispatch({ type: 'SetRouter', router: mockRouter })
    })

    act(() => {
      result.current.actions.updateAudioLanguage('530')
    })

    expect(mockSetCookie).toHaveBeenCalledWith('AUDIO_LANGUAGE', '530')
    expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLE_LANGUAGE', '530')
    expect(mockSetCookie).toHaveBeenCalledTimes(2)
  })

  it('should trigger router reload', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WatchProvider initialState={defaultInitialState}>
        {children}
      </WatchProvider>
    )

    const { result } = renderHook(
      () => {
        const { dispatch } = useWatch()
        const actions = useLanguageActions()
        return { dispatch, actions }
      },
      { wrapper }
    )

    // Set up the state after render using act
    await act(async () => {
      result.current.dispatch({ type: 'SetRouter', router: mockRouter })
    })

    const callCountBefore = mockReload.mock.calls.length

    act(() => {
      result.current.actions.updateAudioLanguage('530')
    })

    // Give a moment for setTimeout to execute
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
    })

    expect(mockReload.mock.calls.length).toBe(callCountBefore + 1)
  })

  it('should not trigger reload when router is not available', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WatchProvider initialState={defaultInitialState}>
        {children}
      </WatchProvider>
    )

    const { result } = renderHook(() => useLanguageActions(), { wrapper })

    act(() => {
      result.current.updateAudioLanguage('530')
    })

    expect(mockReload).not.toHaveBeenCalled()
  })

  it('should set subtitle language cookie without triggering reload', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WatchProvider initialState={defaultInitialState}>
        {children}
      </WatchProvider>
    )

    const { result } = renderHook(
      () => {
        const { dispatch } = useWatch()
        const actions = useLanguageActions()
        return { dispatch, actions }
      },
      { wrapper }
    )

    // Set up the state after render using act
    await act(async () => {
      result.current.dispatch({ type: 'SetRouter', router: mockRouter })
    })

    act(() => {
      result.current.actions.updateSubtitleLanguage('531')
    })

    expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLE_LANGUAGE', '531')
    expect(mockSetCookie).toHaveBeenCalledTimes(1)

    // Should not trigger router reload
    expect(mockReload).not.toHaveBeenCalled()
  })

  it('should set subtitles on cookie for enabled true', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WatchProvider initialState={defaultInitialState}>
        {children}
      </WatchProvider>
    )

    const { result } = renderHook(() => useLanguageActions(), { wrapper })

    act(() => {
      result.current.updateSubtitlesOn(true)
    })

    expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLES_ON', 'true')
    expect(mockSetCookie).toHaveBeenCalledTimes(1)

    // Should not trigger router reload
    expect(mockReload).not.toHaveBeenCalled()
  })

  it('should set subtitles off cookie for enabled false', () => {
    const initialState = { ...defaultInitialState, subtitleOn: true }
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WatchProvider initialState={initialState}>{children}</WatchProvider>
    )

    const { result } = renderHook(() => useLanguageActions(), { wrapper })

    act(() => {
      result.current.updateSubtitlesOn(false)
    })

    expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLES_ON', 'false')
    expect(mockSetCookie).toHaveBeenCalledTimes(1)

    // Should not trigger router reload
    expect(mockReload).not.toHaveBeenCalled()
  })

  it('should allow direct dispatch calls', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WatchProvider initialState={defaultInitialState}>
        {children}
      </WatchProvider>
    )

    const { result } = renderHook(() => useLanguageActions(), { wrapper })

    act(() => {
      result.current.dispatch({
        type: 'SetLoading',
        loading: true
      })
    })

    // Direct dispatch should work without throwing
    expect(result.current.dispatch).toBeDefined()
  })

  it('should memoize functions correctly', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WatchProvider initialState={defaultInitialState}>
        {children}
      </WatchProvider>
    )

    const { result, rerender } = renderHook(() => useLanguageActions(), {
      wrapper
    })

    const firstUpdateSiteLanguage = result.current.updateSiteLanguage
    const firstUpdateAudioLanguage = result.current.updateAudioLanguage
    const firstUpdateSubtitleLanguage = result.current.updateSubtitleLanguage
    const firstUpdateSubtitlesOn = result.current.updateSubtitlesOn

    // Rerender with same dependencies
    rerender()

    expect(result.current.updateSiteLanguage).toBe(firstUpdateSiteLanguage)
    expect(result.current.updateAudioLanguage).toBe(firstUpdateAudioLanguage)
    expect(result.current.updateSubtitleLanguage).toBe(
      firstUpdateSubtitleLanguage
    )
    expect(result.current.updateSubtitlesOn).toBe(firstUpdateSubtitlesOn)
  })
})
