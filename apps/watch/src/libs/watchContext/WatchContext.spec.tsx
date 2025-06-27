import { MockedProvider } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  WatchAction,
  WatchInitialState,
  WatchProvider,
  WatchState,
  reducer,
  useWatch,
  videoPlayerInitialState
} from './WatchContext'

describe('WatchContext', () => {
  describe('reducer', () => {
    const defaultState: WatchState = {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false,
      player: {
        play: false,
        active: false,
        currentTime: '00:00',
        progress: 0,
        volume: 0.5,
        mute: false,
        fullscreen: false,
        openSubtitleDialog: false,
        loadSubtitleDialog: false,
        loading: false,
        duration: '00:00',
        durationSeconds: 0,
        progressPercentNotYetEmitted: [10, 25, 50, 75, 90]
      }
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
        const mockVideoAudioLanguages = [
          {
            language: {
              id: '529',
              bcp47: 'en',
              __typename: 'Language',
              slug: 'english',
              name: [
                { primary: true, value: 'English', __typename: 'LanguageName' }
              ]
            },
            slug: 'english',
            __typename: 'LanguageWithSlug'
          }
        ] as any

        const action: WatchAction = {
          type: 'SetVideoAudioLanguages',
          videoAudioLanguages: mockVideoAudioLanguages
        }

        const result = reducer(defaultState, action)

        expect(result.videoAudioLanguages).toEqual(mockVideoAudioLanguages)
        expect(result.currentAudioLanguage).toEqual(mockVideoAudioLanguages[0])
      })

      it('should set currentAudioLanguage to undefined when no match found', () => {
        const stateWithDifferentLanguage = {
          ...defaultState,
          audioLanguage: '999'
        }

        const mockVideoAudioLanguages = [
          {
            language: {
              id: '529',
              bcp47: 'en',
              __typename: 'Language',
              slug: 'english',
              name: [
                { primary: true, value: 'English', __typename: 'LanguageName' }
              ]
            },
            slug: 'english',
            __typename: 'LanguageWithSlug'
          }
        ] as any

        const action: WatchAction = {
          type: 'SetVideoAudioLanguages',
          videoAudioLanguages: mockVideoAudioLanguages
        }

        const result = reducer(stateWithDifferentLanguage, action)

        expect(result.currentAudioLanguage).toBeUndefined()
      })
    })

    describe('SetVideoSubtitleLanguages', () => {
      it('should set video subtitle languages and enable subtitles when language matches', () => {
        const mockVideoSubtitleLanguages = [
          {
            language: { id: '529', bcp47: 'en' },
            value: 'English subtitles',
            __typename: 'VideoSubtitle'
          }
        ] as any

        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguages',
          videoSubtitleLanguages: mockVideoSubtitleLanguages
        }

        const result = reducer(defaultState, action)

        expect(result.videoSubtitleLanguages).toEqual(
          mockVideoSubtitleLanguages
        )
        expect(result.currentSubtitleOn).toBe(true)
      })

      it('should disable subtitles when language does not match', () => {
        const stateWithDifferentLanguage = {
          ...defaultState,
          subtitleLanguage: '999'
        }

        const mockVideoSubtitleLanguages = [
          {
            language: { id: '529', bcp47: 'en' },
            value: 'English subtitles',
            __typename: 'VideoSubtitle'
          }
        ] as any

        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguages',
          videoSubtitleLanguages: mockVideoSubtitleLanguages
        }

        const result = reducer(stateWithDifferentLanguage, action)

        expect(result.currentSubtitleOn).toBe(false)
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
        expect(result.loading).toBe(true)
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

    describe('SetPlayerPlay', () => {
      it('should set player play state', () => {
        const action: WatchAction = { type: 'SetPlayerPlay', play: true }
        const result = reducer(defaultState, action)
        expect(result.player.play).toBe(true)
      })
    })

    describe('SetPlayerActive', () => {
      it('should set player active state', () => {
        const action: WatchAction = { type: 'SetPlayerActive', active: true }
        const result = reducer(defaultState, action)
        expect(result.player.active).toBe(true)
      })
    })

    describe('SetPlayerCurrentTime', () => {
      it('should set player current time', () => {
        const action: WatchAction = {
          type: 'SetPlayerCurrentTime',
          currentTime: '1:23'
        }
        const result = reducer(defaultState, action)
        expect(result.player.currentTime).toBe('1:23')
      })
    })

    describe('SetPlayerProgress', () => {
      it('should set player progress', () => {
        const action: WatchAction = { type: 'SetPlayerProgress', progress: 50 }
        const result = reducer(defaultState, action)
        expect(result.player.progress).toBe(50)
      })
    })

    describe('SetPlayerVolume', () => {
      it('should set player volume', () => {
        const action: WatchAction = { type: 'SetPlayerVolume', volume: 0.8 }
        const result = reducer(defaultState, action)
        expect(result.player.volume).toBe(0.8)
      })
    })

    describe('SetPlayerMute', () => {
      it('should set player mute state', () => {
        const action: WatchAction = { type: 'SetPlayerMute', mute: true }
        const result = reducer(defaultState, action)
        expect(result.player.mute).toBe(true)
      })
    })

    describe('SetPlayerFullscreen', () => {
      it('should set player fullscreen state', () => {
        const action: WatchAction = {
          type: 'SetPlayerFullscreen',
          fullscreen: true
        }
        const result = reducer(defaultState, action)
        expect(result.player.fullscreen).toBe(true)
      })
    })

    describe('SetPlayerOpenSubtitleDialog', () => {
      it('should set open subtitle dialog state', () => {
        const action: WatchAction = {
          type: 'SetPlayerOpenSubtitleDialog',
          openSubtitleDialog: true
        }
        const result = reducer(defaultState, action)
        expect(result.player.openSubtitleDialog).toBe(true)
      })
    })

    describe('SetPlayerLoadSubtitleDialog', () => {
      it('should set load subtitle dialog state', () => {
        const action: WatchAction = {
          type: 'SetPlayerLoadSubtitleDialog',
          loadSubtitleDialog: true
        }
        const result = reducer(defaultState, action)
        expect(result.player.loadSubtitleDialog).toBe(true)
      })
    })

    describe('SetPlayerLoading', () => {
      it('should set player loading state', () => {
        const action: WatchAction = {
          type: 'SetPlayerLoading',
          loading: true
        }
        const result = reducer(defaultState, action)
        expect(result.player.loading).toBe(true)
      })
    })

    describe('SetPlayerDurationSeconds', () => {
      it('should set player duration in seconds', () => {
        const action: WatchAction = {
          type: 'SetPlayerDurationSeconds',
          durationSeconds: 180
        }
        const result = reducer(defaultState, action)
        expect(result.player.durationSeconds).toBe(180)
      })
    })

    describe('SetPlayerDuration', () => {
      it('should set player duration string', () => {
        const action: WatchAction = {
          type: 'SetPlayerDuration',
          duration: '3:00'
        }
        const result = reducer(defaultState, action)
        expect(result.player.duration).toBe('3:00')
      })
    })

    describe('SetPlayerProgressPercentNotYetEmitted', () => {
      it('should set progress percent not yet emitted', () => {
        const action: WatchAction = {
          type: 'SetPlayerProgressPercentNotYetEmitted',
          progressPercentNotYetEmitted: [25, 50, 75, 90]
        }
        const result = reducer(defaultState, action)
        expect(result.player.progressPercentNotYetEmitted).toEqual([
          25, 50, 75, 90
        ])
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
        subtitleLanguage: '529',
        subtitleOn: false,
        loading: false,
        player: videoPlayerInitialState
      })
    })

    it('should set initial state with additional properties', () => {
      const initialStateWithExtras: WatchInitialState = {
        ...defaultInitialState,
        videoId: 'test-video'
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
        player: videoPlayerInitialState
      })
    })
  })
})
