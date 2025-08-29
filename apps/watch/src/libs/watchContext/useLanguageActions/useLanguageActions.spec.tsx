import { renderHook } from '@testing-library/react'
import { NextRouter } from 'next/router'
import { ReactNode } from 'react'

import { setCookie } from '../../cookieHandler'
import { WatchInitialState, WatchProvider } from '../WatchContext'

import { useLanguageActions } from './useLanguageActions'

// Mock the dependencies
jest.mock('../../cookieHandler', () => ({
  setCookie: jest.fn()
}))

const mockSetCookie = setCookie as jest.MockedFunction<typeof setCookie>

describe('useLanguageActions', () => {
  const mockPush = jest.fn()
  const mockRouter = {
    push: mockPush,
    asPath: '/test/page.html'
  } as unknown as NextRouter

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

  describe('updateAudioLanguage', () => {
    it('should set audio and subtitle language cookies', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider
          initialState={
            {
              ...defaultInitialState,
              router: mockRouter
            } as unknown as WatchInitialState
          }
        >
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateAudioLanguage(mockAllLanguages[1]) // Spanish language object

      expect(mockSetCookie).toHaveBeenCalledWith('AUDIO_LANGUAGE', '530')
      expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLE_LANGUAGE', '530')
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/test/spanish.html',
        query: undefined
      })
    })

    it('should trigger router navigation when language has slug', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider
          initialState={
            {
              ...defaultInitialState,
              router: mockRouter
            } as unknown as WatchInitialState
          }
        >
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateAudioLanguage(mockAllLanguages[1]) // Spanish language object

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/test/spanish.html',
        query: undefined
      })
    })

    it('should not trigger navigation when router is not available', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider initialState={defaultInitialState}>
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateAudioLanguage(mockAllLanguages[1]) // Spanish language object

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not trigger navigation when reload is false', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider
          initialState={
            {
              ...defaultInitialState,
              router: mockRouter
            } as unknown as WatchInitialState
          }
        >
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateAudioLanguage(mockAllLanguages[1], false) // Spanish language object

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('updateSubtitleLanguage', () => {
    it('should set subtitle language cookie', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider
          initialState={
            {
              ...defaultInitialState,
              router: mockRouter
            } as unknown as WatchInitialState
          }
        >
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateSubtitleLanguage('531')

      expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLE_LANGUAGE', '531')
      expect(mockSetCookie).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateSubtitlesOn', () => {
    it('should set subtitles on cookie for enabled true', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider
          initialState={
            {
              ...defaultInitialState,
              router: mockRouter
            } as unknown as WatchInitialState
          }
        >
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateSubtitlesOn(true)

      expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLES_ON', 'true')
    })

    it('should set subtitles off cookie for enabled false', () => {
      const initialState = { ...defaultInitialState, subtitleOn: true }
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider initialState={initialState}>{children}</WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateSubtitlesOn(false)

      expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLES_ON', 'false')
    })
  })

  describe('memoization', () => {
    it('should memoize functions correctly', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider initialState={defaultInitialState}>
          {children}
        </WatchProvider>
      )

      const { result, rerender } = renderHook(() => useLanguageActions(), {
        wrapper
      })

      const firstUpdateAudioLanguage = result.current.updateAudioLanguage
      const firstUpdateSubtitleLanguage = result.current.updateSubtitleLanguage
      const firstUpdateSubtitlesOn = result.current.updateSubtitlesOn

      // Rerender with same dependencies
      rerender()

      expect(result.current.updateAudioLanguage).toBe(firstUpdateAudioLanguage)
      expect(result.current.updateSubtitleLanguage).toBe(
        firstUpdateSubtitleLanguage
      )
      expect(result.current.updateSubtitlesOn).toBe(firstUpdateSubtitlesOn)
    })
  })
})
