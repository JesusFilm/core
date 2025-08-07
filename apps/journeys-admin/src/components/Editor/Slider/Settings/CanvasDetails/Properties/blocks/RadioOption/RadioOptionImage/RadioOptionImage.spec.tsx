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
import {
  RadioOptionImageUpdate,
  RadioOptionImageUpdateVariables
} from '../../../../../../../../../../__generated__/RadioOptionImageUpdate'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'
import { createCloudflareUploadByUrlMock } from '../../../../../Drawer/ImageBlockEditor/CustomImage/CustomUrl/data'
import { listUnsplashCollectionPhotosMock } from '../../../../../Drawer/ImageBlockEditor/UnsplashGallery/data'

import {
  RADIO_OPTION_IMAGE_CREATE,
  RADIO_OPTION_IMAGE_DELETE,
  RADIO_OPTION_IMAGE_RESTORE,
  RADIO_OPTION_IMAGE_UPDATE
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
  journeyTheme: null
}

const radioOption: TreeBlock<RadioOptionBlock> = {
  id: 'radioOption1.id',
  __typename: 'RadioOptionBlock',
  parentBlockId: 'radioQuestion1.id',
  parentOrder: 0,
  pollOptionImageBlockId: null,
  children: [],
  label: 'radio option 1',
  action: {
    __typename: 'LinkAction',
    url: 'https://example.com',
    parentBlockId: 'radioQuestion1.id',
    gtmEventName: 'radioOption1.id'
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
  focalTop: 50
}

describe('RadioOptionImage', () => {
  let originalEnv

  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

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
          parentBlockId: radioOption.id,
          src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
          alt: 'public'
        }
      }
    },
    result: {
      data: {
        imageBlockCreate: {
          id: image.id,
          src: image.src,
          alt: image.alt,
          __typename: 'ImageBlock',
          parentBlockId: radioOption.id,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash,
          scale: null,
          focalLeft: 50,
          focalTop: 50
        },
        radioOptionBlockUpdate: {
          id: radioOption.id,
          pollOptionImageBlockId: image.id,
          __typename: 'RadioOptionBlock'
        }
      }
    }
  }

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

  describe('Creating a new image', () => {
    it('creates a new image for radio option', async () => {
      mockUuidv4.mockReturnValueOnce(image.id)
      const cache = new InMemoryCache()
      cache.restore({
        [`Journey:${journey.id}`]: {
          blocks: [{ __ref: `RadioOptionBlock:${radioOption.id}` }],
          id: journey.id,
          __typename: 'Journey'
        },
        [`RadioOptionBlock:${radioOption.id}`]: { ...radioOption }
      })
      render(
        <MockedProvider
          cache={cache}
          mocks={[
            createCloudflareUploadByUrlMock,
            radioOptionImageCreateMock,
            radioOptionImageDeleteMock,
            radioOptionImageRestoreMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <RadioOptionImage radioOptionBlock={radioOption} />
                <CommandUndoItem variant="button" />
                <CommandRedoItem variant="button" />
              </CommandProvider>
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Select Image' }))
      await waitFor(() =>
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: 'Add image by URL' })
        )
      )
      const textBox = await screen.getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      fireEvent.blur(textBox)
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ])
      )
      expect(
        cache.extract()[`RadioOptionBlock:${radioOption.id}`]
          ?.pollOptionImageBlockId
      ).toEqual(image.id)
    })

    it('undo creating a new image', async () => {
      mockUuidv4.mockReturnValueOnce(image.id)
      const cache = new InMemoryCache()
      cache.restore({
        [`Journey:${journey.id}`]: {
          blocks: [{ __ref: `RadioOptionBlock:${radioOption.id}` }],
          id: journey.id,
          __typename: 'Journey'
        },
        [`RadioOptionBlock:${radioOption.id}`]: { ...radioOption }
      })
      render(
        <MockedProvider
          cache={cache}
          mocks={[
            createCloudflareUploadByUrlMock,
            radioOptionImageCreateMock,
            radioOptionImageDeleteMock,
            radioOptionImageRestoreMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <RadioOptionImage radioOptionBlock={radioOption} />
                <CommandUndoItem variant="button" />
                <CommandRedoItem variant="button" />
              </CommandProvider>
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Select Image' }))
      await waitFor(() =>
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: 'Add image by URL' })
        )
      )
      const textBox = await screen.getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      fireEvent.blur(textBox)
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` }
        ])
      )
      expect(
        cache.extract()[`RadioOptionBlock:${radioOption.id}`]
          ?.pollOptionImageBlockId
      ).toBeNull()
    })

    it('restore creating a new image', async () => {
      mockUuidv4.mockReturnValueOnce(image.id)
      const cache = new InMemoryCache()
      cache.restore({
        [`Journey:${journey.id}`]: {
          blocks: [{ __ref: `RadioOptionBlock:${radioOption.id}` }],
          id: journey.id,
          __typename: 'Journey'
        },
        [`RadioOptionBlock:${radioOption.id}`]: { ...radioOption }
      })
      render(
        <MockedProvider
          cache={cache}
          mocks={[
            createCloudflareUploadByUrlMock,
            radioOptionImageCreateMock,
            radioOptionImageDeleteMock,
            radioOptionImageRestoreMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <CommandProvider>
                <RadioOptionImage radioOptionBlock={radioOption} />
                <CommandUndoItem variant="button" />
                <CommandRedoItem variant="button" />
              </CommandProvider>
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Select Image' }))
      await waitFor(() =>
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: 'Add image by URL' })
        )
      )
      const textBox = await screen.getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      fireEvent.blur(textBox)
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` }
        ])
      )
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() =>
        expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
          { __ref: `RadioOptionBlock:${radioOption.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ])
      )
      expect(
        cache.extract()[`RadioOptionBlock:${radioOption.id}`]
          ?.pollOptionImageBlockId
      ).toEqual(image.id)
    })
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

    it('updates image for radio option', async () => {
      const response: RadioOptionImageUpdate = {
        imageBlockUpdate: {
          id: image.id,
          src: image.src,
          alt: image.alt,
          __typename: 'ImageBlock',
          parentBlockId: radioOption.id,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash,
          scale: null,
          focalLeft: 50,
          focalTop: 50
        }
      }
      const radioOptionImageUpdateMock: MockedResponse<
        RadioOptionImageUpdate,
        RadioOptionImageUpdateVariables
      > = {
        request: {
          query: RADIO_OPTION_IMAGE_UPDATE,
          variables: {
            id: image.id,
            input: {
              src: image.src,
              alt: image.alt
            }
          }
        },
        result: {
          data: response
        }
      }
      const updateResult = jest.fn(() => ({
        data: response
      }))
      render(
        <MockedProvider
          mocks={[
            listUnsplashCollectionPhotosMock,
            createCloudflareUploadByUrlMock,
            {
              ...radioOptionImageUpdateMock,
              result: updateResult
            }
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
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: 'Add image by URL' })
        )
      )
      const textBox = await screen.getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      fireEvent.blur(textBox)
      await waitFor(() => expect(updateResult).toHaveBeenCalled())
    })

    it('undo updating an image', async () => {
      const response: RadioOptionImageUpdate = {
        imageBlockUpdate: {
          id: image.id,
          src: image.src,
          alt: image.alt,
          __typename: 'ImageBlock',
          parentBlockId: radioOption.id,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash,
          scale: null,
          focalLeft: 50,
          focalTop: 50
        }
      }
      const radioOptionImageUpdateMock: MockedResponse<
        RadioOptionImageUpdate,
        RadioOptionImageUpdateVariables
      > = {
        request: {
          query: RADIO_OPTION_IMAGE_UPDATE,
          variables: {
            id: image.id,
            input: {
              src: image.src,
              alt: image.alt
            }
          }
        },
        result: {
          data: response
        }
      }
      const updateResult = jest.fn(() => ({
        data: response
      }))
      const undoResult = jest.fn(() => ({
        data: response
      }))
      render(
        <MockedProvider
          mocks={[
            listUnsplashCollectionPhotosMock,
            createCloudflareUploadByUrlMock,
            {
              ...radioOptionImageUpdateMock,
              result: updateResult
            },
            {
              ...radioOptionImageUpdateMock,
              request: {
                ...radioOptionImageUpdateMock.request,
                variables: {
                  ...radioOptionImageUpdateMock.request.variables,
                  input: {
                    ...radioOptionImageUpdateMock.request.variables?.input,
                    src: 'https://example.com/old.jpg',
                    alt: 'prior-alt'
                  }
                }
              },
              result: undoResult
            }
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
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: 'Add image by URL' })
        )
      )
      const textBox = await screen.getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      fireEvent.blur(textBox)
      await waitFor(() => expect(updateResult).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())
    })

    it('redo updating an image', async () => {
      const response: RadioOptionImageUpdate = {
        imageBlockUpdate: {
          id: image.id,
          src: image.src,
          alt: image.alt,
          __typename: 'ImageBlock',
          parentBlockId: radioOption.id,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash,
          scale: null,
          focalLeft: 50,
          focalTop: 50
        }
      }
      const radioOptionImageUpdateMock: MockedResponse<
        RadioOptionImageUpdate,
        RadioOptionImageUpdateVariables
      > = {
        request: {
          query: RADIO_OPTION_IMAGE_UPDATE,
          variables: {
            id: image.id,
            input: {
              src: image.src,
              alt: image.alt
            }
          }
        },
        result: {
          data: response
        }
      }
      const updateResult = jest.fn(() => ({
        data: response
      }))
      const undoResult = jest.fn(() => ({
        data: response
      }))
      const redoResult = jest.fn(() => ({
        data: response
      }))
      render(
        <MockedProvider
          mocks={[
            listUnsplashCollectionPhotosMock,
            createCloudflareUploadByUrlMock,
            {
              ...radioOptionImageUpdateMock,
              result: updateResult
            },
            {
              ...radioOptionImageUpdateMock,
              request: {
                ...radioOptionImageUpdateMock.request,
                variables: {
                  ...radioOptionImageUpdateMock.request.variables,
                  input: {
                    ...radioOptionImageUpdateMock.request.variables?.input,
                    src: 'https://example.com/old.jpg',
                    alt: 'prior-alt'
                  }
                }
              },
              result: undoResult
            },
            {
              ...radioOptionImageUpdateMock,
              result: redoResult
            }
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
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: 'Add image by URL' })
        )
      )
      const textBox = await screen.getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      fireEvent.blur(textBox)
      await waitFor(() => expect(updateResult).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(redoResult).toHaveBeenCalled())
    })

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
          mocks={[radioOptionImageDeleteMock, radioOptionImageRestoreMock]}
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
