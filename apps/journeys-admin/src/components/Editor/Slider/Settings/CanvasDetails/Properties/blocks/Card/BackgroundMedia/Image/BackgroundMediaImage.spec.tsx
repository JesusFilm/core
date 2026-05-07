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
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import {
  CoverBlockDelete,
  CoverBlockDeleteVariables
} from '../../../../../../../../../../../__generated__/CoverBlockDelete'
import {
  CoverBlockRestore,
  CoverBlockRestoreVariables
} from '../../../../../../../../../../../__generated__/CoverBlockRestore'
import {
  CoverImageBlockCreate,
  CoverImageBlockCreateVariables
} from '../../../../../../../../../../../__generated__/CoverImageBlockCreate'
import {
  CoverImageBlockUpdate,
  CoverImageBlockUpdateVariables
} from '../../../../../../../../../../../__generated__/CoverImageBlockUpdate'
import { GetJourney_journey as Journey } from '../../../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../../__generated__/globalTypes'
import { COVER_BLOCK_DELETE } from '../../../../../../../../../../libs/useCoverBlockDeleteMutation/useCoverBlockDeleteMutation'
import { COVER_BLOCK_RESTORE } from '../../../../../../../../../../libs/useCoverBlockRestoreMutation/useCoverBlockRestoreMutation'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'
import {
  listUnsplashCollectionPhotosMock,
  triggerUnsplashDownloadMock
} from '../../../../../../Drawer/ImageBlockEditor/UnsplashGallery/data'

import {
  COVER_IMAGE_BLOCK_CREATE,
  COVER_IMAGE_BLOCK_UPDATE
} from './BackgroundMediaImage'

import { BackgroundMediaImage } from '.'

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
  strategySlug: null,
  featuredAt: null,
  title: 'my journey',
  slug: 'my-journey',
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
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
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

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  eventLabel: null,
  children: []
}

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: card.id,
  parentOrder: 0,
  src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
  alt: 'public',
  width: 1920,
  height: 1080,
  blurhash: '',
  children: [],
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

describe('BackgroundMediaImage', () => {
  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
  })

  const coverBlockDeleteMock: MockedResponse<
    CoverBlockDelete,
    CoverBlockDeleteVariables
  > = {
    request: {
      query: COVER_BLOCK_DELETE,
      variables: {
        id: image.id,
        cardBlockId: card.id
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
        cardBlockUpdate: {
          id: card.id,
          coverBlockId: null,
          __typename: 'CardBlock'
        }
      }
    }
  }

  const coverBlockRestoreMock: MockedResponse<
    CoverBlockRestore,
    CoverBlockRestoreVariables
  > = {
    request: {
      query: COVER_BLOCK_RESTORE,
      variables: {
        id: image.id,
        cardBlockId: card.id
      }
    },
    result: {
      data: {
        blockRestore: [image],
        cardBlockUpdate: {
          id: card.id,
          coverBlockId: image.id,
          __typename: 'CardBlock'
        }
      }
    }
  }

  it('creates a new image cover block from gallery selection', async () => {
    mockUuidv4.mockReturnValueOnce(image.id)
    const cache = new InMemoryCache()
    cache.restore({
      [`Journey:${journey.id}`]: {
        blocks: [{ __ref: `CardBlock:${card.id}` }],
        id: journey.id,
        __typename: 'Journey'
      },
      [`CardBlock:${card.id}`]: { ...card }
    })
    const response: CoverImageBlockCreate = {
      imageBlockCreate: {
        ...image,
        ...unsplashImageInput
      },
      cardBlockUpdate: {
        id: card.id,
        coverBlockId: image.id,
        __typename: 'CardBlock'
      }
    }
    const createResult = jest.fn(() => ({
      data: response
    }))
    const coverImageBlockCreateMock: MockedResponse<
      CoverImageBlockCreate,
      CoverImageBlockCreateVariables
    > = {
      request: {
        query: COVER_IMAGE_BLOCK_CREATE,
        variables: {
          id: image.id,
          cardBlockId: card.id,
          input: {
            journeyId: journey.id,
            isCover: true,
            id: image.id,
            ...unsplashImageInput,
            parentBlockId: card.id
          }
        }
      },
      result: createResult
    }

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          listUnsplashCollectionPhotosMock,
          triggerUnsplashDownloadMock,
          coverImageBlockCreateMock
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <SnackbarProvider>
            <CommandProvider>
              <BackgroundMediaImage cardBlock={card} />
            </CommandProvider>
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Image' }))
    await waitFor(() =>
      expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'white dome building during daytime' })
    )

    await waitFor(() => expect(createResult).toHaveBeenCalled())
    expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
      { __ref: `CardBlock:${card.id}` },
      { __ref: `ImageBlock:${image.id}` }
    ])
    expect(cache.extract()[`CardBlock:${card.id}`]?.coverBlockId).toEqual(
      image.id
    )
  })

  describe('Existing image cover', () => {
    const existingCoverBlock: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: image.id,
      children: [
        {
          ...image,
          src: 'https://example.com/old.jpg',
          alt: 'prior-alt'
        }
      ]
    }

    it('updates image cover block from gallery selection', async () => {
      const updateResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            ...image,
            ...unsplashImageInput
          }
        }
      }))
      const coverImageBlockUpdateMock: MockedResponse<
        CoverImageBlockUpdate,
        CoverImageBlockUpdateVariables
      > = {
        request: {
          query: COVER_IMAGE_BLOCK_UPDATE,
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
            coverImageBlockUpdateMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <BackgroundMediaImage cardBlock={existingCoverBlock} />
              </CommandProvider>
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('button', {
          name: 'prior-alt Selected Image 1920 x 1080 pixels'
        })
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
            { __ref: `CardBlock:${card.id}` },
            { __ref: `ImageBlock:${image.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        },
        [`ImageBlock:${image.id}`]: { ...image }
      })
      render(
        <MockedProvider
          cache={cache}
          mocks={[
            coverBlockDeleteMock,
            coverBlockRestoreMock,
            coverBlockDeleteMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <BackgroundMediaImage cardBlock={existingCoverBlock} />
                <CommandUndoItem variant="button" />
                <CommandRedoItem variant="button" />
              </CommandProvider>
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'prior-alt Selected Image 1920 x 1080 pixels'
        })
      )
      await waitFor(() =>
        expect(screen.getByTestId('imageBlockHeaderDelete')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByTestId('imageBlockHeaderDelete'))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `CardBlock:${card.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `CardBlock:${card.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `CardBlock:${card.id}` }
        ])
      )
    })
  })
})
