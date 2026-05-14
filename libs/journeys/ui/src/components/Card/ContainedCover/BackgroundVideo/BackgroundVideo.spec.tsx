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
      vi
        .mocked(videojs)
        .mockReturnValue(playerRefMock as unknown as Player)
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
  })
})
