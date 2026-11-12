import { render } from '@testing-library/react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import { VideoFields } from '../../../Video/__generated__/VideoFields'

import { BackgroundVideo } from './BackgroundVideo'

vi.mock('video.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('video.js')>()
  return {
    ...actual,
    default: vi.fn()
  }
})

const video: TreeBlock<VideoFields> = {
  id: 'videoId',
  __typename: 'VideoBlock',
  parentBlockId: 'cardId',
  parentOrder: 0,
  startAt: 0,
  endAt: 144,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '5_0-NUA0201-0-0',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: 144,
  image: null,
  objectFit: null,
  subtitleLanguage: null,
  showGeneratedSubtitles: null,
  eventLabel: null,
  endEventLabel: null,
  mediaVideo: {
    __typename: 'Video',
    id: '5_0-NUA0201-0-0',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '5_0-NUA0201-0-0-529',
      hls: 'https://arc.gt/hls/5_0-NUA0201-0-0/529'
    },
    variantLanguages: []
  },
  posterBlockId: null,
  customizable: null,
  notes: null,
  children: []
}

const playerRefMock = {
  current: null,
  on: vi.fn(),
  off: vi.fn(),
  ready: vi.fn(),
  currentTime: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  src: vi.fn(),
  dispose: vi.fn()
}

describe('BackgroundVideo', () => {
  describe('BackgroundVideo', () => {
    beforeEach(() => {
      vi.mocked(videojs).mockReturnValue(playerRefMock as unknown as Player)
    })

    it('should set container to 16:9', () => {
      const { getByTestId } = render(
        <BackgroundVideo setLoading={vi.fn()} cardColor="black" {...video} />
      )

      // Expect container to have 16:9 aspect ratio
      expect(getByTestId('CardContainedBackgroundVideo')).toHaveStyle(
        'position: absolute'
      )

      expect(getByTestId('CardContainedBackgroundVideo')).toHaveStyle(
        'overflow: hidden'
      )

      // Jest height/width are not rendered by jest dom for testing
    })

    describe('captions', () => {
      function mockTextTracks(
        tracks: Array<Pick<TextTrack, 'kind' | 'mode'>>
      ): typeof tracks & {
        addEventListener: ReturnType<typeof vi.fn>
        removeEventListener: ReturnType<typeof vi.fn>
      } {
        const textTracks = Object.assign(tracks, {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        })
        vi.mocked(videojs).mockReturnValue({
          ...playerRefMock,
          textTracks: () => textTracks
        } as unknown as Player)
        return textTracks
      }

      it('should turn off every subtitle and caption track', () => {
        const textTracks = mockTextTracks([
          { kind: 'captions', mode: 'showing' },
          { kind: 'subtitles', mode: 'hidden' },
          { kind: 'metadata', mode: 'hidden' }
        ])

        render(
          <BackgroundVideo setLoading={vi.fn()} cardColor="black" {...video} />
        )

        expect(textTracks.map(({ mode }) => mode)).toEqual([
          'disabled',
          'disabled',
          'hidden'
        ])
      })

      it('should keep captions off when mux subtitles are turned on', () => {
        const textTracks = mockTextTracks([
          { kind: 'captions', mode: 'showing' },
          { kind: 'subtitles', mode: 'showing' }
        ])

        render(
          <BackgroundVideo
            setLoading={vi.fn()}
            cardColor="black"
            {...video}
            source={VideoBlockSource.mux}
            showGeneratedSubtitles
          />
        )

        expect(textTracks.map(({ mode }) => mode)).toEqual([
          'disabled',
          'disabled'
        ])
      })

      it('should turn off tracks the stream adds later', () => {
        const textTracks = mockTextTracks([])

        render(
          <BackgroundVideo setLoading={vi.fn()} cardColor="black" {...video} />
        )

        textTracks.push({ kind: 'subtitles', mode: 'showing' })
        const handleAddTrack = textTracks.addEventListener.mock.calls.find(
          ([event]) => event === 'addtrack'
        )?.[1]
        handleAddTrack()

        expect(textTracks[0].mode).toBe('disabled')
      })

      it('should turn captions back off when the browser switches one on', () => {
        const textTracks = mockTextTracks([
          { kind: 'captions', mode: 'disabled' }
        ])

        render(
          <BackgroundVideo setLoading={vi.fn()} cardColor="black" {...video} />
        )

        textTracks[0].mode = 'showing'
        const handleChange = textTracks.addEventListener.mock.calls.find(
          ([event]) => event === 'change'
        )?.[1]
        handleChange()

        expect(textTracks[0].mode).toBe('disabled')
      })

      it('should unload youtube captions when the video plays', () => {
        const unloadModule = vi.fn()
        const on = vi.fn()
        vi.mocked(videojs).mockReturnValue({
          ...playerRefMock,
          on,
          // Playing always unloads, even if YouTube reports no captions module
          tech: () => ({ ytPlayer: { unloadModule, getOptions: () => [] } })
        } as unknown as Player)

        render(
          <BackgroundVideo
            setLoading={vi.fn()}
            cardColor="black"
            {...video}
            source={VideoBlockSource.youTube}
            mediaVideo={null}
          />
        )

        on.mock.calls
          .filter(([event]) => event === 'playing')
          .forEach(([, handlePlaying]) => handlePlaying())

        expect(unloadModule).toHaveBeenCalledWith('captions')
      })

      it('should unload youtube captions whenever youtube loads them', () => {
        const unloadModule = vi.fn()
        const addEventListener = vi.fn()
        let loadedModules = ['captions']
        vi.mocked(videojs).mockReturnValue({
          ...playerRefMock,
          ready: (callback: () => void) => callback(),
          tech: () => ({
            ytPlayer: {
              unloadModule,
              addEventListener,
              getOptions: () => loadedModules
            }
          })
        } as unknown as Player)

        render(
          <BackgroundVideo
            setLoading={vi.fn()}
            cardColor="black"
            {...video}
            source={VideoBlockSource.youTube}
            mediaVideo={null}
          />
        )

        const handleApiChange = addEventListener.mock.calls.find(
          ([event]) => event === 'onApiChange'
        )?.[1]
        handleApiChange()
        expect(unloadModule).toHaveBeenCalledTimes(1)

        // Unloading fires onApiChange again, which must not unload again
        loadedModules = []
        handleApiChange()
        expect(unloadModule).toHaveBeenCalledTimes(1)
      })

      it('should leave unloading to playing when youtube cannot list its modules', () => {
        const unloadModule = vi.fn()
        const addEventListener = vi.fn()
        vi.mocked(videojs).mockReturnValue({
          ...playerRefMock,
          ready: (callback: () => void) => callback(),
          tech: () => ({ ytPlayer: { unloadModule, addEventListener } })
        } as unknown as Player)

        render(
          <BackgroundVideo
            setLoading={vi.fn()}
            cardColor="black"
            {...video}
            source={VideoBlockSource.youTube}
            mediaVideo={null}
          />
        )

        const handleApiChange = addEventListener.mock.calls.find(
          ([event]) => event === 'onApiChange'
        )?.[1]
        handleApiChange()
        expect(unloadModule).not.toHaveBeenCalled()
      })

      it('should remove every caption listener when unmounted', () => {
        const textTracks = Object.assign([], {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        })
        const off = vi.fn()
        const addEventListener = vi.fn()
        const removeEventListener = vi.fn()
        vi.mocked(videojs).mockReturnValue({
          ...playerRefMock,
          off,
          textTracks: () => textTracks,
          ready: (callback: () => void) => callback(),
          tech: () => ({
            ytPlayer: {
              unloadModule: vi.fn(),
              addEventListener,
              removeEventListener
            }
          })
        } as unknown as Player)

        const { unmount } = render(
          <BackgroundVideo
            setLoading={vi.fn()}
            cardColor="black"
            {...video}
            source={VideoBlockSource.youTube}
            mediaVideo={null}
          />
        )
        unmount()

        const removedTrackEvents =
          textTracks.removeEventListener.mock.calls.map(([event]) => event)
        expect(removedTrackEvents).toEqual(
          expect.arrayContaining(['addtrack', 'change'])
        )
        expect(off).toHaveBeenCalledWith('playing', expect.any(Function))
        expect(removeEventListener).toHaveBeenCalledWith(
          'onApiChange',
          addEventListener.mock.calls[0][1]
        )
      })

      it('should not listen to youtube once unmounted before the player is ready', () => {
        let handleReady: () => void = () => undefined
        const addEventListener = vi.fn()
        vi.mocked(videojs).mockReturnValue({
          ...playerRefMock,
          ready: (callback: () => void) => {
            handleReady = callback
          },
          tech: () => ({
            ytPlayer: { unloadModule: vi.fn(), addEventListener }
          })
        } as unknown as Player)

        const { unmount } = render(
          <BackgroundVideo
            setLoading={vi.fn()}
            cardColor="black"
            {...video}
            source={VideoBlockSource.youTube}
            mediaVideo={null}
          />
        )
        unmount()
        handleReady()

        expect(addEventListener).not.toHaveBeenCalled()
      })
    })
  })
})
