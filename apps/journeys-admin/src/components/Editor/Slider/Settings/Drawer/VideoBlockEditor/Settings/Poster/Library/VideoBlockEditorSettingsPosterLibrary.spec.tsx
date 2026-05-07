import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../../../__generated__/globalTypes'
import {
  PosterImageBlockDelete,
  PosterImageBlockDeleteVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockDelete'
import {
  PosterImageBlockRestore,
  PosterImageBlockRestoreVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockRestore'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import {
  POSTER_IMAGE_BLOCK_DELETE,
  POSTER_IMAGE_BLOCK_RESTORE
} from './VideoBlockEditorSettingsPosterLibrary'

import { VideoBlockEditorSettingsPosterLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  strategySlug: null,
  slug: 'my-journey',
  featuredAt: null,
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  template: null,
  userJourneys: [],
  creatorDescription: null,
  creatorImageBlock: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null,
  socialNodeX: null,
  socialNodeY: null,
  customizable: null,
  showAssistant: null
}

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  subtitleLanguage: null,
  showGeneratedSubtitles: null,
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
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
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: []
  },
  posterBlockId: null,
  eventLabel: null,
  endEventLabel: null,
  children: [],
  customizable: null,
  notes: null
}

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: video.id,
  parentOrder: 0,
  src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
  alt: 'public',
  width: 1920,
  height: 1080,
  blurhash: '',
  scale: null,
  focalLeft: 50,
  focalTop: 50,
  customizable: null
}

const onClose = jest.fn()

describe('VideoBlockEditorSettingsPosterLibrary', () => {
  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
  })

  const posterImageBlockDeleteMock: MockedResponse<
    PosterImageBlockDelete,
    PosterImageBlockDeleteVariables
  > = {
    request: {
      query: POSTER_IMAGE_BLOCK_DELETE,
      variables: {
        id: image.id,
        parentBlockId: video.id
      }
    },
    result: {
      data: {
        blockDelete: [
          {
            id: image.id,
            __typename: 'ImageBlock',
            parentOrder: null
          }
        ],
        videoBlockUpdate: {
          id: video.id,
          posterBlockId: null,
          __typename: 'VideoBlock'
        }
      }
    }
  }

  const posterImageBlockRestoreMock: MockedResponse<
    PosterImageBlockRestore,
    PosterImageBlockRestoreVariables
  > = {
    request: {
      query: POSTER_IMAGE_BLOCK_RESTORE,
      variables: {
        id: image.id,
        videoBlockId: video.id
      }
    },
    result: {
      data: {
        blockRestore: [image],
        videoBlockUpdate: {
          id: video.id,
          posterBlockId: image.id,
          __typename: 'VideoBlock'
        }
      }
    }
  }

  describe('Existing image poster', () => {
    it('deletes an image block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        [`Journey:${journey.id}`]: {
          blocks: [
            { __ref: `VideoBlock:${video.id}` },
            { __ref: `ImageBlock:${image.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        }
      })
      render(
        <MockedProvider
          cache={cache}
          mocks={[
            posterImageBlockDeleteMock,
            posterImageBlockRestoreMock,
            posterImageBlockDeleteMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <VideoBlockEditorSettingsPosterLibrary
                  selectedBlock={image}
                  parentBlockId={video.id}
                  onClose={onClose}
                  open
                />
                <CommandUndoItem variant="button" />
                <CommandRedoItem variant="button" />
              </CommandProvider>
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      const button = screen.getByTestId('imageBlockHeaderDelete')
      fireEvent.click(button)
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `VideoBlock:${video.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `VideoBlock:${video.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `VideoBlock:${video.id}` }
        ])
      )
    })
  })
})
