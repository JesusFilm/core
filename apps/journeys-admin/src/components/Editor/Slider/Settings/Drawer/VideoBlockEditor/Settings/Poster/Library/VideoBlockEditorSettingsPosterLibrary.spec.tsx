import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

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
  PosterImageBlockCreate,
  PosterImageBlockCreateVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockCreate'
import {
  PosterImageBlockDelete,
  PosterImageBlockDeleteVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockDelete'
import {
  PosterImageBlockRestore,
  PosterImageBlockRestoreVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockRestore'
import {
  PosterImageBlockUpdate,
  PosterImageBlockUpdateVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockUpdate'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'
import {
  listUnsplashCollectionPhotosMock,
  triggerUnsplashDownloadMock
} from '../../../../ImageBlockEditor/UnsplashGallery/data'

import {
  POSTER_IMAGE_BLOCK_CREATE,
  POSTER_IMAGE_BLOCK_DELETE,
  POSTER_IMAGE_BLOCK_RESTORE,
  POSTER_IMAGE_BLOCK_UPDATE
} from './VideoBlockEditorSettingsPosterLibrary'

import { VideoBlockEditorSettingsPosterLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

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

const unsplashImageInput = {
  src: 'https://images.unsplash.com/photo-1618777618311-92f986a6519d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
  alt: 'white dome building during daytime',
  blurhash: 'LEA,%vRjE1ay.AV@WAj@tnoef5ju',
  height: 720,
  width: 1080,
  scale: 100,
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

  it('creates a new image poster block from gallery selection', async () => {
    mockUuidv4.mockReturnValueOnce(image.id)
    const response: PosterImageBlockCreate = {
      imageBlockCreate: {
        ...image,
        ...unsplashImageInput
      },
      videoBlockUpdate: {
        id: video.id,
        posterBlockId: image.id,
        __typename: 'VideoBlock'
      }
    }
    const createResult = jest.fn(() => ({
      data: response
    }))
    const posterImageBlockCreateMock: MockedResponse<
      PosterImageBlockCreate,
      PosterImageBlockCreateVariables
    > = {
      request: {
        query: POSTER_IMAGE_BLOCK_CREATE,
        variables: {
          id: image.id,
          parentBlockId: video.id,
          input: {
            journeyId: journey.id,
            id: image.id,
            parentBlockId: video.id,
            ...unsplashImageInput,
            scale: null
          }
        }
      },
      result: createResult
    }

    render(
      <MockedProvider
        mocks={[
          listUnsplashCollectionPhotosMock,
          triggerUnsplashDownloadMock,
          posterImageBlockCreateMock
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <SnackbarProvider>
            <CommandProvider>
              <VideoBlockEditorSettingsPosterLibrary
                selectedBlock={null}
                parentBlockId={video.id}
                onClose={onClose}
                open
              />
            </CommandProvider>
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'white dome building during daytime' })
    )

    await waitFor(() => expect(createResult).toHaveBeenCalled())
  })

  describe('Existing image poster', () => {
    it('updates image poster block from gallery selection', async () => {
      const updateResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            ...image,
            ...unsplashImageInput
          }
        }
      }))
      const posterImageBlockUpdateMock: MockedResponse<
        PosterImageBlockUpdate,
        PosterImageBlockUpdateVariables
      > = {
        request: {
          query: POSTER_IMAGE_BLOCK_UPDATE,
          variables: {
            id: image.id,
            input: unsplashImageInput
          }
        },
        result: updateResult
      }

      render(
        <MockedProvider
          mocks={[
            listUnsplashCollectionPhotosMock,
            triggerUnsplashDownloadMock,
            posterImageBlockUpdateMock
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
              </CommandProvider>
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'white dome building during daytime'
        })
      )

      await waitFor(() => expect(updateResult).toHaveBeenCalled())
    })

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
