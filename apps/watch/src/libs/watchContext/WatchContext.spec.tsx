import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  WatchAction,
  WatchInitialState,
  WatchProvider,
  WatchState,
  reducer,
  useWatch
} from './WatchContext'

describe('WatchContext', () => {
  describe('reducer', () => {
    const defaultState: WatchState = {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false
    }

    describe('SetLanguagePreferences', () => {
      it('should update only provided preference fields', () => {
        const action: WatchAction = {
          type: 'SetLanguagePreferences',
          siteLanguage: 'es',
          audioLanguage: '496'
        }

        const result = reducer(defaultState, action)

        expect(result).toEqual({
          ...defaultState,
          siteLanguage: 'es',
          audioLanguage: '496'
        })
      })

      it('should preserve existing values when partial update is provided', () => {
        const action: WatchAction = {
          type: 'SetLanguagePreferences',
          subtitleOn: true
        }

        const result = reducer(defaultState, action)

        expect(result).toEqual({
          ...defaultState,
          subtitleOn: true
        })
      })
    })

    describe('SetAllLanguages', () => {
      it('should set all available languages', () => {
        const mockLanguages = [
          {
            id: '529',
            bcp47: 'en',
            slug: 'english',
            name: [
              { primary: true, value: 'English', __typename: 'LanguageName' }
            ],
            __typename: 'Language'
          },
          {
            id: '496',
            bcp47: 'es',
            slug: 'spanish',
            name: [
              { primary: true, value: 'Spanish', __typename: 'LanguageName' }
            ],
            __typename: 'Language'
          }
        ] as any

        const action: WatchAction = {
          type: 'SetAllLanguages',
          allLanguages: mockLanguages
        }

        const result = reducer(defaultState, action)

        expect(result).toEqual({
          ...defaultState,
          allLanguages: mockLanguages
        })
      })
    })

    describe('SetVideoAudioLanguages', () => {
      it('should set video audio languages and select matching currentAudioLanguage', () => {
        const mockVideoAudioLanguageIdAndSlugs = [
          {
            id: '529',
            slug: 'english'
          }
        ]

        const action: WatchAction = {
          type: 'SetVideoAudioLanguages',
          videoAudioLanguagesIdsAndSlugs: mockVideoAudioLanguageIdAndSlugs
        }

        const result = reducer(defaultState, action)

        expect(result.videoAudioLanguagesIdsAndSlugs).toEqual(
          mockVideoAudioLanguageIdAndSlugs
        )
        expect(result.currentAudioLanguage).toEqual(
          mockVideoAudioLanguageIdAndSlugs[0]
        )
      })

      it('should set currentAudioLanguage to undefined when no match found', () => {
        const stateWithDifferentAudioLanguage = {
          ...defaultState,
          audioLanguage: '999'
        }

        const mockVideoAudioLanguageIdAndSlugs = [
          {
            id: '529',
            slug: 'english'
          }
        ]

        const action: WatchAction = {
          type: 'SetVideoAudioLanguages',
          videoAudioLanguagesIdsAndSlugs: mockVideoAudioLanguageIdAndSlugs
        }

        const result = reducer(stateWithDifferentAudioLanguage, action)

        expect(result.currentAudioLanguage).toBeUndefined()
      })
    })

    describe('SetVideoSubtitleLanguages', () => {
      it('should set video subtitle languages and enable subtitles when language matches', () => {
        const mockVideoSubtitleLanguageIds = ['529']

        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguages',
          videoSubtitleLanguageIds: mockVideoSubtitleLanguageIds
        }

        const result = reducer(defaultState, action)

        expect(result.videoSubtitleLanguageIds).toEqual(
          mockVideoSubtitleLanguageIds
        )
        expect(result.autoSubtitle).toBe(true)
      })

      it('should disable subtitles when language does not match', () => {
        const stateWithDifferentSubtitleLanguage = {
          ...defaultState,
          subtitleLanguage: '999'
        }

        const mockVideoSubtitleLanguageIds = ['529']

        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguages',
          videoSubtitleLanguageIds: mockVideoSubtitleLanguageIds
        }

        const result = reducer(stateWithDifferentSubtitleLanguage, action)

        expect(result.autoSubtitle).toBe(undefined)
      })

      it('should not set autoSubtitle when language preference is met langPrefMet is true)', () => {
        const stateWithMatchingAudioLanguage = {
          ...defaultState,
          audioLanguage: '529',
          currentAudioLanguage: {
            id: '529',
            slug: 'english'
          }
        }

        const mockVideoSubtitleLanguageIds = ['529']

        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguages',
          videoSubtitleLanguageIds: mockVideoSubtitleLanguageIds
        }

        const result = reducer(stateWithMatchingAudioLanguage, action)

        expect(result.videoSubtitleLanguageIds).toEqual(
          mockVideoSubtitleLanguageIds
        )
        expect(result.autoSubtitle).toBeUndefined()
      })

      it('should set autoSubtitle to true when language preference is not met and subtitle language is available', () => {
        const stateWithNonMatchingAudioLanguage = {
          ...defaultState,
          audioLanguage: '496',
          subtitleLanguage: '529',
          currentAudioLanguage: {
            id: '999',
            slug: 'french'
          }
        }

        const mockVideoSubtitleLanguageIds = ['529']

        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguages',
          videoSubtitleLanguageIds: mockVideoSubtitleLanguageIds
        }

        const result = reducer(stateWithNonMatchingAudioLanguage, action)

        expect(result.videoSubtitleLanguageIds).toEqual(
          mockVideoSubtitleLanguageIds
        )
        expect(result.autoSubtitle).toBe(true)
      })

      it('should set autoSubtitle to undefined when language preference is not met and subtitle language is not available', () => {
        const stateWithNonMatchingAudioLanguage = {
          ...defaultState,
          audioLanguage: '496',
          subtitleLanguage: '999',
          currentAudioLanguage: {
            id: '777',
            slug: 'french'
          }
        }

        const mockVideoSubtitleLanguageIds = ['529']

        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguages',
          videoSubtitleLanguageIds: mockVideoSubtitleLanguageIds
        }

        const result = reducer(stateWithNonMatchingAudioLanguage, action)

        expect(result.videoSubtitleLanguageIds).toEqual(
          mockVideoSubtitleLanguageIds
        )
        expect(result.autoSubtitle).toBe(undefined)
      })

      it('should handle case when currentAudioLanguage is undefined', () => {
        const stateWithUndefinedCurrentAudioLanguage = {
          ...defaultState,
          audioLanguage: '496',
          subtitleLanguage: '529',
          currentAudioLanguage: undefined
        }

        const mockVideoSubtitleLanguageIds = ['529']

        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguages',
          videoSubtitleLanguageIds: mockVideoSubtitleLanguageIds
        }

        const result = reducer(stateWithUndefinedCurrentAudioLanguage, action)

        expect(result.videoSubtitleLanguageIds).toEqual(
          mockVideoSubtitleLanguageIds
        )
        expect(result.autoSubtitle).toBe(true)
      })
    })

    describe('SetCurrentVideo', () => {
      it('should set current video information', () => {
        const action: WatchAction = {
          type: 'SetCurrentVideo',
          videoId: 'video-123',
          videoVariantSlug: 'variant-abc'
        }

        const result = reducer(defaultState, action)

        expect(result).toEqual({
          ...defaultState,
          videoId: 'video-123',
          videoVariantSlug: 'variant-abc'
        })
      })
    })

    describe('SetLoading', () => {
      it('should set loading state', () => {
        const action: WatchAction = {
          type: 'SetLoading',
          loading: true
        }

        const result = reducer(defaultState, action)

        expect(result).toEqual({
          ...defaultState,
          loading: true
        })
      })
    })

    describe('SetRouter', () => {
      it('should set router instance', () => {
        const mockRouter = {
          push: jest.fn(),
          pathname: '/test'
        } as any

        const action: WatchAction = {
          type: 'SetRouter',
          router: mockRouter
        }

        const result = reducer(defaultState, action)

        expect(result).toEqual({
          ...defaultState,
          router: mockRouter
        })
      })
    })

    describe('UpdateSiteLanguage', () => {
      it('should update site language with cascading to audio and subtitle languages', () => {
        const mockLanguages = [
          {
            id: '529',
            bcp47: 'en',
            slug: 'english',
            name: [{ primary: true, value: 'English' }],
            __typename: 'Language' as const
          },
          {
            id: '496',
            bcp47: 'es',
            slug: 'spanish',
            name: [{ primary: true, value: 'Spanish' }],
            __typename: 'Language' as const
          }
        ]

        const stateWithLanguages = {
          ...defaultState,
          allLanguages: mockLanguages
        } as WatchState

        const action: WatchAction = {
          type: 'UpdateSiteLanguage',
          language: 'es'
        }

        const result = reducer(stateWithLanguages, action)

        expect(result.siteLanguage).toBe('es')
        expect(result.audioLanguage).toBe('496')
        expect(result.subtitleLanguage).toBe('496')
        expect(result.loading).toBe(true)
      })

      it('should preserve existing language values when no matching language found', () => {
        const action: WatchAction = {
          type: 'UpdateSiteLanguage',
          language: 'fr'
        }

        const result = reducer(defaultState, action)

        expect(result.siteLanguage).toBe('fr')
        expect(result.audioLanguage).toBe(defaultState.audioLanguage)
        expect(result.subtitleLanguage).toBe(defaultState.subtitleLanguage)
        expect(result.loading).toBe(true)
      })
    })

    describe('UpdateAudioLanguage', () => {
      it('should update audio language and cascade to subtitle language', () => {
        const action: WatchAction = {
          type: 'UpdateAudioLanguage',
          languageId: '496'
        }

        const result = reducer(defaultState, action)

        expect(result.audioLanguage).toBe('496')
        expect(result.subtitleLanguage).toBe('496')
      })
    })

    describe('UpdateSubtitleLanguage', () => {
      it('should update subtitle language only', () => {
        const action: WatchAction = {
          type: 'UpdateSubtitleLanguage',
          languageId: '496'
        }

        const result = reducer(defaultState, action)

        expect(result.subtitleLanguage).toBe('496')
        expect(result.audioLanguage).toBe(defaultState.audioLanguage)
        expect(result.loading).toBe(defaultState.loading)
      })
    })

    describe('UpdateSubtitlesOn', () => {
      it('should update subtitles enabled state', () => {
        const action: WatchAction = {
          type: 'UpdateSubtitlesOn',
          enabled: true
        }

        const result = reducer(defaultState, action)

        expect(result).toEqual({
          ...defaultState,
          subtitleOn: true
        })
      })
    })

    describe('UpdateAutoSubtitlesOn', () => {
      it('should update autoSubtitle state', () => {
        const action: WatchAction = {
          type: 'UpdateAutoSubtitlesOn',
          autoSubtitle: true
        }

        const result = reducer(defaultState, action)

        expect(result.autoSubtitle).toBe(true)
      })
    })
  })

  describe('WatchProvider', () => {
    const defaultInitialState: WatchInitialState = {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false
    }

    it('should set initial state', () => {
      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultInitialState}>
            {children}
          </WatchProvider>
        </MockedProvider>
      )

      const { result } = renderHook(() => useWatch(), {
        wrapper
      })

      expect(result.current.state).toEqual({
        siteLanguage: 'en',
        audioLanguage: '529',
        autoSubtitle: undefined,
        videoSubtitleLanguageIds: [],
        videoAudioLanguagesIdsAndSlugs: [],
        currentAudioLanguage: undefined,
        subtitleLanguage: '529',
        subtitleOn: false,
        loading: false
      })
    })

    it('should set initial state with additional properties', async () => {
      const initialStateWithExtras: WatchInitialState = {
        ...defaultInitialState,
        videoId: 'test-video',
        videoSubtitleLanguageIds: ['529'],
        videoAudioLanguagesIdsAndSlugs: [
          {
            id: '529',
            slug: 'english'
          }
        ]
      }

      const expectedCurrentAudioLanguage = {
        id: '529',
        slug: 'english'
      }

      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={initialStateWithExtras}>
            {children}
          </WatchProvider>
        </MockedProvider>
      )

      const { result } = renderHook(() => useWatch(), {
        wrapper
      })

      expect(result.current.state).toEqual({
        siteLanguage: 'en',
        audioLanguage: '529',
        subtitleLanguage: '529',
        subtitleOn: false,
        loading: false,
        videoId: 'test-video',
        videoSubtitleLanguageIds: ['529'],
        videoAudioLanguagesIdsAndSlugs: [expectedCurrentAudioLanguage],
        currentAudioLanguage: expectedCurrentAudioLanguage
      })
    })

    it('should set auto subtitles to true if audio language does not match any available audio language and subtitle language matches an available subtitle language', async () => {
      const initialStateWithExtras: WatchInitialState = {
        ...defaultInitialState,
        videoId: 'test-video',
        audioLanguage: '999', // does NOT match the videoAudioLanguages below
        subtitleLanguage: '529', // matches the videoSubtitleLanguages below
        videoSubtitleLanguageIds: ['529'],
        videoAudioLanguagesIdsAndSlugs: [
          {
            id: '529',
            slug: 'english'
          }
        ]
      }

      const expectedCurrentAudioLanguage = {
        id: '529',
        slug: 'english'
      }

      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={initialStateWithExtras}>
            {children}
          </WatchProvider>
        </MockedProvider>
      )

      const { result } = renderHook(() => useWatch(), {
        wrapper
      })

      expect(result.current.state).toEqual({
        siteLanguage: 'en',
        audioLanguage: '999',
        subtitleLanguage: '529',
        subtitleOn: false,
        autoSubtitle: true,
        loading: false,
        videoId: 'test-video',
        videoSubtitleLanguageIds: ['529'],
        videoAudioLanguagesIdsAndSlugs: [expectedCurrentAudioLanguage],
        currentAudioLanguage: undefined
      })

      await waitFor(() => {
        expect(result.current.state.autoSubtitle).toBe(true)
      })
    })
  })
})
