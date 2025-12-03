import { renderHook } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import { ReactNode } from 'react'

import { setCookie } from '../../cookieHandler'
import { WatchProvider, WatchState } from '../WatchContext'

import { useLanguageActions } from './useLanguageActions'

// Mock the dependencies
jest.mock('../../cookieHandler', () => ({
  setCookie: jest.fn()
}))

const mockSetCookie = setCookie as jest.MockedFunction<typeof setCookie>

describe('useLanguageActions', () => {
  const defaultInitialState: WatchState = {
    audioLanguageId: '529',
    subtitleLanguageId: '529',
    subtitleOn: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateAudioLanguage', () => {
    it('should set audio and subtitle language cookies', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider>{children}</WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateAudioLanguage({ id: '496', slug: 'french' }, false)

      expect(mockSetCookie).toHaveBeenCalledWith('AUDIO_LANGUAGE', '496')
      expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLE_LANGUAGE', '496')
    })

    it('should trigger router navigation when language has slug', async () => {
      await mockRouter.push('/jesus.html/english.html')
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider>{children}</WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateAudioLanguage({ id: '496', slug: 'french' })

      expect(mockRouter).toMatchObject({
        pathname: '/jesus.html/french.html',
        query: {}
      })
    })

    it('should not trigger router navigation when reload is false', async () => {
      await mockRouter.push('/jesus.html/english.html')
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider>{children}</WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateAudioLanguage({ id: '496', slug: 'french' }, false)

      expect(mockRouter).toMatchObject({
        pathname: '/jesus.html/english.html',
        query: {}
      })
    })
  })

  describe('updateSubtitleLanguage', () => {
    it('should set subtitle language cookie', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WatchProvider
          initialState={
            {
              ...defaultInitialState,
              router: mockRouter
            } as unknown as WatchState
          }
        >
          {children}
        </WatchProvider>
      )

      const { result } = renderHook(() => useLanguageActions(), { wrapper })

      result.current.updateSubtitleLanguage({ id: '531' })

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
            } as unknown as WatchState
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
})
