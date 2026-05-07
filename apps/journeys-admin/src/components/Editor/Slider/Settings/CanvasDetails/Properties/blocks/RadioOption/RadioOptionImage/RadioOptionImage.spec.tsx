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
  BlockFields_RadioOptionBlock as RadioOptionBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import {
  RadioOptionImageCreate,
  RadioOptionImageCreateVariables
} from '../../../../../../../../../../__generated__/RadioOptionImageCreate'
import {
  RadioOptionImageDelete,
  RadioOptionImageDeleteVariables
} from '../../../../../../../../../../__generated__/RadioOptionImageDelete'
import {
  RadioOptionImageRestore,
  RadioOptionImageRestoreVariables
} from '../../../../../../../../../../__generated__/RadioOptionImageRestore'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'
import {
  listUnsplashCollectionPhotosMock,
  triggerUnsplashDownloadMock
} from '../../../../../Drawer/ImageBlockEditor/UnsplashGallery/data'

import {
  RADIO_OPTION_IMAGE_CREATE,
  RADIO_OPTION_IMAGE_DELETE,
  RADIO_OPTION_IMAGE_RESTORE
} from './RadioOptionImage'

import { RadioOptionImage } from '.'

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

const radioOption: TreeBlock<RadioOptionBlock> = {
  id: 'radioOption1.id',
  __typename: 'RadioOptionBlock',
  parentBlockId: 'radioQuestion1.id',
  parentOrder: 0,
  pollOptionImageBlockId: null,
  children: [],
  label: 'radio option 1',
  eventLabel: null,
  action: {
    __typename: 'LinkAction',
    url: 'https://example.com',
    parentBlockId: 'radioQuestion1.id',
    gtmEventName: 'radioOption1.id',
    customizable: false,
    parentStepId: null
  }
}

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: radioOption.id,
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

describe('RadioOptionImage', () => {
  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
  })

  const radioOptionImageDeleteMock: MockedResponse<
    RadioOptionImageDelete,
    RadioOptionImageDeleteVariables
  > = {
    request: {
      query: RADIO_OPTION_IMAGE_DELETE,
      variables: {
        id: image.id,
        radioOptionBlockId: radioOption.id
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
        radioOptionBlockUpdate: {
          id: radioOption.id,
          pollOptionImageBlockId: null,
          __typename: 'RadioOptionBlock'
        }
      }
    }
  }

  const radioOptionImageRestoreMock: MockedResponse<
    RadioOptionImageRestore,
    RadioOptionImageRestoreVariables
  > = {
    request: {
      query: RADIO_OPTION_IMAGE_RESTORE,
      variables: {
        id: image.id,
        radioOptionBlockId: radioOption.id
      }
    },
    result: {
      data: {
        blockRestore: [image],
        radioOptionBlockUpdate: {
          id: radioOption.id,
          pollOptionImageBlockId: image.id,
          __typename: 'RadioOptionBlock'
        }
      }
    }
  }

  it('creates a new image for radio option from gallery selection', async () => {
    mockUuidv4.mockReturnValueOnce(image.id)
    const response: RadioOptionImageCreate = {
      imageBlockCreate: {
        ...image,
        ...unsplashImageInput
      },
      radioOptionBlockUpdate: {
        id: radioOption.id,
        pollOptionImageBlockId: image.id,
        __typename: 'RadioOptionBlock'
      }
    }
    const createResult = jest.fn(() => ({
      data: response
    }))
    const radioOptionImageCreateMock: MockedResponse<
      RadioOptionImageCreate,
      RadioOptionImageCreateVariables
    > = {
      request: {
        query: RADIO_OPTION_IMAGE_CREATE,
        variables: {
          id: image.id,
          radioOptionBlockId: radioOption.id,
          input: {
            journeyId: journey.id,
            id: image.id,
            ...unsplashImageInput,
            parentBlockId: radioOption.id
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
          radioOptionImageCreateMock
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <SnackbarProvider>
            <CommandProvider>
              <RadioOptionImage radioOptionBlock={radioOption} />
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
  })

  describe('Existing image for radio option', () => {
    const existingImageRadioOption: TreeBlock<RadioOptionBlock> = {
      ...radioOption,
      pollOptionImageBlockId: image.id,
      children: [
        {
          ...image,
          src: 'https://example.com/old.jpg',
          alt: 'prior-alt'
        }
      ]
    }

    it('deletes an image block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        [`Journey:${journey.id}`]: {
          blocks: [
            { __ref: `RadioOptionBlock:${radioOption.id}` },
            { __ref: `ImageBlock:${image.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        },
        [`ImageBlock:${image.id}`]: { ...image }
      })
      render(
        <MockedProvider cache={cache} mocks={[radioOptionImageDeleteMock]}>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <RadioOptionImage radioOptionBlock={existingImageRadioOption} />
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
          { __ref: `RadioOptionBlock:${radioOption.id}` }
        ])
      )
    })

    it('undo deleting an image block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        [`Journey:${journey.id}`]: {
          blocks: [
            { __ref: `RadioOptionBlock:${radioOption.id}` },
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
            listUnsplashCollectionPhotosMock,
            listUnsplashCollectionPhotosMock,
            radioOptionImageDeleteMock,
            radioOptionImageRestoreMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <RadioOptionImage radioOptionBlock={existingImageRadioOption} />
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
          { __ref: `RadioOptionBlock:${radioOption.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ])
      )
    })

    it('redo deleting an image block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        [`Journey:${journey.id}`]: {
          blocks: [
            { __ref: `RadioOptionBlock:${radioOption.id}` },
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
            listUnsplashCollectionPhotosMock,
            listUnsplashCollectionPhotosMock,
            radioOptionImageDeleteMock,
            radioOptionImageRestoreMock,
            radioOptionImageDeleteMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <RadioOptionImage radioOptionBlock={existingImageRadioOption} />
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
          { __ref: `RadioOptionBlock:${radioOption.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` }
        ])
      )
    })
  })
})
