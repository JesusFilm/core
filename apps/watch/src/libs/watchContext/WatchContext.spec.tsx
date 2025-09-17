import { MockedProvider } from '@apollo/client/testing'
import { render, renderHook, screen } from '@testing-library/react'
import { ReactNode } from 'react'

import { TestWatchState } from './TestWatchState'
import {
  WatchAction,
  WatchProvider,
  WatchState,
  reducer,
  useWatch
} from './WatchContext'

describe('WatchContext', () => {
  describe('reducer', () => {
    describe('SetLanguagePreferences', () => {
      it('should update audio language id', () => {
        const result = reducer(
          {
            audioLanguageId: '529',
            subtitleLanguageId: '529',
            subtitleOn: false
          },
          {
            type: 'SetLanguagePreferences',
            audioLanguageId: '496'
          }
        )
        expect(result).toEqual({
          audioLanguageId: '496',
          subtitleLanguageId: '529',
          subtitleOn: false
        })
      })

      it('should update subtitle language id', () => {
        const result = reducer(
          {
            audioLanguageId: '529',
            subtitleLanguageId: '529',
            subtitleOn: false
          },
          {
            type: 'SetLanguagePreferences',
            subtitleLanguageId: '496'
          }
        )
        expect(result).toEqual({
          audioLanguageId: '529',
          subtitleLanguageId: '496',
          subtitleOn: false
        })
      })

      it('should update subtitle on', () => {
        const result = reducer(
          {
            audioLanguageId: '529',
            subtitleLanguageId: '529',
            subtitleOn: false
          },
          {
            type: 'SetLanguagePreferences',
            subtitleOn: true
          }
        )
        expect(result).toEqual({
          audioLanguageId: '529',
          subtitleLanguageId: '529',
          subtitleOn: true
        })
      })

      it('should update all preferences', () => {
        const result = reducer(
          {
            audioLanguageId: '529',
            subtitleLanguageId: '529',
            subtitleOn: false
          },
          {
            type: 'SetLanguagePreferences',
            audioLanguageId: '496',
            subtitleLanguageId: '496',
            subtitleOn: true
          }
        )
        expect(result).toEqual({
          audioLanguageId: '496',
          subtitleLanguageId: '496',
          subtitleOn: true
        })
      })
    })

    describe('SetVideoAudioLanguageIds', () => {
      it('should set video audio languages', () => {
        const videoAudioLanguageIds = ['529']
        const action: WatchAction = {
          type: 'SetVideoAudioLanguageIds',
          videoAudioLanguageIds
        }
        const result = reducer({}, action)
        expect(result.videoAudioLanguageIds).toEqual(videoAudioLanguageIds)
      })
    })

    describe('SetVideoSubtitleLanguageIds', () => {
      it('should set video subtitle languages', () => {
        const videoSubtitleLanguageIds = ['529']
        const action: WatchAction = {
          type: 'SetVideoSubtitleLanguageIds',
          videoSubtitleLanguageIds
        }
        const result = reducer({}, action)
        expect(result.videoSubtitleLanguageIds).toEqual(
          videoSubtitleLanguageIds
        )
      })
    })
  })

  describe('WatchProvider', () => {
    const defaultInitialState: WatchState = {
      audioLanguageId: '529',
      subtitleLanguageId: '529',
      subtitleOn: false
    }

    it('should set initial state', () => {
      const { rerender } = render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultInitialState}>
            <TestWatchState />
          </WatchProvider>
        </MockedProvider>
      )

      expect(screen.getByText('audioLanguageId: 529')).toBeInTheDocument()
      expect(screen.getByText('subtitleLanguageId: 529')).toBeInTheDocument()
      expect(screen.getByText('subtitleOn: false')).toBeInTheDocument()
      expect(screen.getByText('videoAudioLanguageIds: 0')).toBeInTheDocument()
      expect(
        screen.getByText('videoSubtitleLanguageIds: 0')
      ).toBeInTheDocument()

      rerender(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider
            initialState={{
              ...defaultInitialState,
              videoAudioLanguageIds: ['529'],
              videoSubtitleLanguageIds: ['529']
            }}
          >
            <TestWatchState />
          </WatchProvider>
        </MockedProvider>
      )

      expect(screen.getByText('videoAudioLanguageIds: 1')).toBeInTheDocument()
      expect(
        screen.getByText('videoSubtitleLanguageIds: 1')
      ).toBeInTheDocument()
    })
  })

  describe('useWatch', () => {
    it('should return the initial state', () => {
      const { result } = renderHook(() => useWatch(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[]} addTypename={false}>
            <WatchProvider
              initialState={{
                audioLanguageId: '496',
                subtitleLanguageId: '496'
              }}
            >
              {children}
            </WatchProvider>
          </MockedProvider>
        )
      })
      expect(result.current.state).toEqual({
        audioLanguageId: '496',
        subtitleLanguageId: '496'
      })
    })
  })
})
