import { render } from '@testing-library/react'
// eslint-disable-next-line import/no-namespace
import * as videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import { VideoFields } from '../../../Video/__generated__/VideoFields'

import { BackgroundVideo } from './BackgroundVideo'

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
  children: []
}

const playerRefMock = { current: null }

describe('BackgroundVideo', () => {
  describe('BackgroundVideo', () => {
    beforeEach(() => {
      jest
        .spyOn(videojs, 'default')
        .mockReturnValue(playerRefMock as unknown as Player)
    })

    it('should set container to 16:9', () => {
      const { getByTestId } = render(
        <BackgroundVideo setLoading={jest.fn()} cardColor="black" {...video} />
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
