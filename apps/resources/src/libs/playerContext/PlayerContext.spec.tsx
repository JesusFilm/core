import { renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  PlayerAction,
  PlayerProvider,
  PlayerState,
  playerInitialState,
  reducer,
  usePlayer
} from './PlayerContext'

describe('PlayerContext', () => {
  describe('reducer', () => {
    const defaultState: PlayerState = playerInitialState

    describe('SetPlay', () => {
      it('should set player play state', () => {
        const action: PlayerAction = { type: 'SetPlay', play: true }
        const result = reducer(defaultState, action)
        expect(result.play).toBe(true)
      })
    })

    describe('SetActive', () => {
      it('should set player active state', () => {
        const action: PlayerAction = { type: 'SetActive', active: true }
        const result = reducer(defaultState, action)
        expect(result.active).toBe(true)
      })
    })

    describe('SetCurrentTime', () => {
      it('should set player current time', () => {
        const action: PlayerAction = {
          type: 'SetCurrentTime',
          currentTime: '1:23'
        }
        const result = reducer(defaultState, action)
        expect(result.currentTime).toBe('1:23')
      })
    })

    describe('SetProgress', () => {
      it('should set player progress', () => {
        const action: PlayerAction = { type: 'SetProgress', progress: 50 }
        const result = reducer(defaultState, action)
        expect(result.progress).toBe(50)
      })
    })

    describe('SetVolume', () => {
      it('should set player volume', () => {
        const action: PlayerAction = { type: 'SetVolume', volume: 0.8 }
        const result = reducer(defaultState, action)
        expect(result.volume).toBe(0.8)
      })
    })

    describe('SetMute', () => {
      it('should set player mute state', () => {
        const action: PlayerAction = { type: 'SetMute', mute: true }
        const result = reducer(defaultState, action)
        expect(result.mute).toBe(true)
      })
    })

    describe('SetFullscreen', () => {
      it('should set player fullscreen state', () => {
        const action: PlayerAction = {
          type: 'SetFullscreen',
          fullscreen: true
        }
        const result = reducer(defaultState, action)
        expect(result.fullscreen).toBe(true)
      })
    })

    describe('SetOpenSubtitleDialog', () => {
      it('should set open subtitle dialog state', () => {
        const action: PlayerAction = {
          type: 'SetOpenSubtitleDialog',
          openSubtitleDialog: true
        }
        const result = reducer(defaultState, action)
        expect(result.openSubtitleDialog).toBe(true)
      })
    })

    describe('SetLoadSubtitleDialog', () => {
      it('should set load subtitle dialog state', () => {
        const action: PlayerAction = {
          type: 'SetLoadSubtitleDialog',
          loadSubtitleDialog: true
        }
        const result = reducer(defaultState, action)
        expect(result.loadSubtitleDialog).toBe(true)
      })
    })

    describe('SetLoading', () => {
      it('should set player loading state', () => {
        const action: PlayerAction = {
          type: 'SetLoading',
          loading: true
        }
        const result = reducer(defaultState, action)
        expect(result.loading).toBe(true)
      })
    })

    describe('SetDurationSeconds', () => {
      it('should set player duration in seconds', () => {
        const action: PlayerAction = {
          type: 'SetDurationSeconds',
          durationSeconds: 180
        }
        const result = reducer(defaultState, action)
        expect(result.durationSeconds).toBe(180)
      })
    })

    describe('SetDuration', () => {
      it('should set player duration string', () => {
        const action: PlayerAction = {
          type: 'SetDuration',
          duration: '3:00'
        }
        const result = reducer(defaultState, action)
        expect(result.duration).toBe('3:00')
      })
    })

    describe('SetProgressPercentNotYetEmitted', () => {
      it('should set progress percent not yet emitted', () => {
        const action: PlayerAction = {
          type: 'SetProgressPercentNotYetEmitted',
          progressPercentNotYetEmitted: [25, 50, 75, 90]
        }
        const result = reducer(defaultState, action)
        expect(result.progressPercentNotYetEmitted).toEqual([25, 50, 75, 90])
      })
    })
  })

  describe('PlayerProvider', () => {
    it('should set initial state', () => {
      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <PlayerProvider>{children}</PlayerProvider>
      )

      const { result } = renderHook(() => usePlayer(), {
        wrapper
      })

      expect(result.current.state).toEqual(playerInitialState)
    })

    it('should set initial state with additional properties', () => {
      const initialState = {
        play: true,
        active: true
      }
      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <PlayerProvider initialState={initialState}>{children}</PlayerProvider>
      )

      const { result } = renderHook(() => usePlayer(), {
        wrapper
      })

      expect(result.current.state).toEqual({
        ...playerInitialState,
        ...initialState
      })
    })
  })
})
