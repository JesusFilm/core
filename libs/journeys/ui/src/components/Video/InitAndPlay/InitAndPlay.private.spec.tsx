import { cleanup, render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import videojs from 'video.js'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { journey } from '../../../libs/JourneyProvider/JourneyProvider.mock'

import { InitAndPlay } from './InitAndPlay'

const originalMuxPlugin = videojs.getPlugin('mux')

describe('private playback provider telemetry', () => {
  const monitor = vi.fn(function () {})

  beforeEach(() => {
    monitor.mockClear()
    vi.stubEnv(
      'NEXT_PUBLIC_MUX_USER_GENERATED_REPORTING_KEY',
      'controlled-reporting-key'
    )
    vi.stubEnv(
      'NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY',
      'controlled-reporting-key'
    )
    // A controlled provider adapter at video.js's real plugin boundary.
    // No reporting request is sent to the live telemetry provider.
    videojs.deregisterPlugin('mux')
    videojs.registerPlugin('mux', monitor)
  })
  afterEach(() => {
    cleanup()
    videojs.getAllPlayers().forEach((player) => player?.dispose())
    videojs.deregisterPlugin('mux')
    if (originalMuxPlugin) videojs.registerPlugin('mux', originalMuxPlugin)
    vi.unstubAllEnvs()
  })

  it.each(['default', 'embed', 'preview'] as const)(
    'handles configured Mux reporting in %s playback',
    (renderMode) => {
      const video = document.createElement('video')
      document.body.appendChild(video)
      const setPlayer = vi.fn()
      const props: ComponentProps<typeof InitAndPlay> = {
        videoRef: { current: video },
        setPlayer,
        triggerTimes: [],
        videoEndTime: 60,
        blockId: 'private-video',
        muted: false,
        startAt: null,
        endAt: 60,
        autoplay: false,
        posterBlock: undefined,
        source: VideoBlockSource.mux,
        title: 'Saved video',
        mediaVideo: {
          __typename: 'MuxVideo',
          id: 'synthetic-video',
          assetId: 'synthetic-asset',
          playbackId: 'synthetic-playback'
        },
        videoVariantLanguageId: null,
        subtitleLanguage: null,
        activeStep: false,
        setLoading: vi.fn(),
        setShowPoster: vi.fn(),
        setVideoEndTime: vi.fn()
      }
      render(
        <JourneyProvider value={{ journey, renderMode }}>
          <InitAndPlay {...props} />
        </JourneyProvider>
      )
      expect(setPlayer).toHaveBeenCalledOnce()
      if (renderMode === 'preview') {
        expect(monitor).not.toHaveBeenCalled()
        return
      }
      expect(monitor).toHaveBeenCalledOnce()
      expect(monitor).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            env_key: 'controlled-reporting-key',
            custom_1: journey.id,
            custom_2: 'private-video'
          })
        })
      )
    }
  )
})
