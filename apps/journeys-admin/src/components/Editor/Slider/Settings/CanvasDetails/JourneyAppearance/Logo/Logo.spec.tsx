import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import pick from 'lodash/pick'
import { v4 as uuidv4 } from 'uuid'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import {
  ImageBlockUpdate,
  ImageBlockUpdateVariables
} from '../../../../../../../../__generated__/ImageBlockUpdate'
import {
  LogoBlockCreate_imageBlockCreate as ImageBlock,
  LogoBlockCreate,
  LogoBlockCreateVariables
} from '../../../../../../../../__generated__/LogoBlockCreate'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'
import { createCloudflareUploadByUrlMock } from '../../../Drawer/ImageBlockEditor/CustomImage/CustomUrl/data'
import { listUnsplashCollectionPhotosMock } from '../../../Drawer/ImageBlockEditor/UnsplashGallery/data'
import { IMAGE_BLOCK_UPDATE } from '../../Properties/blocks/Image/Options/ImageOptions'

import { LOGO_BLOCK_CREATE } from './Logo'

import { Logo } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('Logo', () => {
  let originalEnv

  beforeEach(() => {
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const defaultJourney = {
    id: 'journeyId',
    __typename: 'Journey',
    logoImageBlock: null
  } as unknown as Journey

  mockUuidv4.mockReturnValue('logoImageBlockId')

  const imageBlock: ImageBlock = {
    __typename: 'ImageBlock',
    id: 'logoImageBlockId',
    parentBlockId: null,
    src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
    alt: 'public',
    scale: 1,
    parentOrder: null,
    width: 1,
    height: 1,
    blurhash: '',
    focalLeft: 50,
    focalTop: 50
  }

  function getLogoImageBlockCreateMock(): MockedResponse<
    LogoBlockCreate,
    LogoBlockCreateVariables
  > {
    return {
      request: {
        query: LOGO_BLOCK_CREATE,
        variables: {
          id: defaultJourney.id,
          imageBlockCreateInput: {
            ...pick(imageBlock, ['id', 'parentBlockId', 'src', 'alt', 'scale']),
            journeyId: defaultJourney.id
          },
          journeyUpdateInput: {
            logoImageBlockId: 'logoImageBlockId'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          imageBlockCreate: imageBlock,
          journeyUpdate: {
            __typename: 'Journey',
            id: defaultJourney.id,
            logoImageBlock: {
              id: 'logoImageBlockId',
              __typename: 'ImageBlock'
            }
          }
        }
      }))
    }
  }

  function getImageBlockUpdateMock(
    id: string,
    input: ImageBlockUpdateInput,
    update?: boolean
  ): MockedResponse<ImageBlockUpdate, ImageBlockUpdateVariables> {
    const updateInput =
      update === true
        ? {
            width: input.width ?? imageBlock.width,
            height: input.height ?? imageBlock.height,
            blurhash: input.blurhash ?? imageBlock.blurhash
          }
        : {}

    return {
      request: {
        query: IMAGE_BLOCK_UPDATE,
        variables: {
          id,
          input: {
            ...input,
            ...updateInput
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            ...imageBlock,
            alt: input.alt ?? imageBlock.alt,
            scale: input.scale ?? imageBlock.scale,
            src: input.src ?? imageBlock.src,
            id,
            ...updateInput
          }
        }
      }))
    }
  }

  it('should create logo image block', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journeyId']: {
        blocks: [],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const createLogoMock = getLogoImageBlockCreateMock()

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          // Unsplash may be queried multiple times parallelly
          listUnsplashCollectionPhotosMock,
          createLogoMock
        ]}
      >
        <JourneyProvider value={{ journey: defaultJourney }}>
          <CommandProvider>
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() => fireEvent.click(screen.getByTestId('card click area')))
    await waitFor(() => fireEvent.click(screen.getByTestId('Image3Icon')))
    await waitFor(() => fireEvent.click(screen.getByTestId('CustomURL')))
    const textBox = screen
      .getByTestId('JourneysAdminTextFieldForm')
      .querySelector('input') as HTMLInputElement
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(createLogoMock.result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'ImageBlock:logoImageBlockId' }
    ])
  })

  it('should undo and redo logo image block create', async () => {
    const createLogoMock = getLogoImageBlockCreateMock()
    const undoMock = getImageBlockUpdateMock(imageBlock.id, {
      src: null
    })
    const redoMock = getImageBlockUpdateMock(imageBlock.id, {
      src: imageBlock.src
    })

    render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          listUnsplashCollectionPhotosMock,
          createLogoMock,
          undoMock,
          redoMock
        ]}
      >
        <JourneyProvider value={{ journey: defaultJourney }}>
          <CommandProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() => fireEvent.click(screen.getByTestId('card click area')))
    await waitFor(() => fireEvent.click(screen.getByTestId('Image3Icon')))
    await waitFor(() => fireEvent.click(screen.getByTestId('CustomURL')))
    const textBox = screen
      .getByTestId('JourneysAdminTextFieldForm')
      .querySelector('input') as HTMLInputElement
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(createLogoMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoMock.result).toHaveBeenCalled())
  })

  it('should update logo image', async () => {
    const journey = {
      ...defaultJourney,
      logoImageBlock: {
        ...imageBlock,
        src: 'https://imagedelivery.net/cloudflare-key/old-uploadId/public'
      }
    }
    const updateMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        src: imageBlock.src,
        alt: 'public'
      },
      true
    )

    render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          listUnsplashCollectionPhotosMock,
          updateMock
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <CommandProvider>
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() => fireEvent.click(screen.getByTestId('card click area')))
    await waitFor(() => fireEvent.click(screen.getByTestId('Image3Icon')))
    await waitFor(() => fireEvent.click(screen.getByTestId('CustomURL')))
    const textBox = screen
      .getByTestId('JourneysAdminTextFieldForm')
      .querySelector('input') as HTMLInputElement
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(updateMock.result).toHaveBeenCalled())
  })

  it('should undo logo image update', async () => {
    const journey = {
      ...defaultJourney,
      logoImageBlock: {
        ...imageBlock,
        src: 'https://imagedelivery.net/cloudflare-key/old-uploadId/public'
      }
    }
    const updateMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        src: imageBlock.src,
        alt: 'public'
      },
      true
    )
    const undoMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        src: journey.logoImageBlock.src,
        alt: 'public'
      },
      true
    )

    render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          listUnsplashCollectionPhotosMock,
          updateMock,
          undoMock
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <CommandProvider>
            <CommandUndoItem variant="button" />
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() => fireEvent.click(screen.getByTestId('card click area')))
    await waitFor(() => fireEvent.click(screen.getByTestId('Image3Icon')))
    await waitFor(() => fireEvent.click(screen.getByTestId('CustomURL')))
    const textBox = screen
      .getByTestId('JourneysAdminTextFieldForm')
      .querySelector('input') as HTMLInputElement
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(updateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoMock.result).toHaveBeenCalled())
  })

  it('should delete logo image block', async () => {
    const journey = {
      ...defaultJourney,
      logoImageBlock: imageBlock
    }
    const deleteMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        src: null,
        alt: ''
      },
      true
    )

    render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          listUnsplashCollectionPhotosMock,
          deleteMock
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <CommandProvider>
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() => fireEvent.click(screen.getByTestId('card click area')))
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('imageBlockHeaderDelete'))
    )

    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
  })

  it('should undo logo image block delete', async () => {
    const journey = {
      ...defaultJourney,
      logoImageBlock: imageBlock
    }
    const deleteMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        src: null,
        alt: ''
      },
      true
    )
    const undoMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        src: imageBlock.src,
        alt: imageBlock.alt
      },
      true
    )

    render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          deleteMock,
          undoMock
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <CommandProvider>
            <CommandUndoItem variant="button" />
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() => fireEvent.click(screen.getByTestId('card click area')))
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('imageBlockHeaderDelete'))
    )
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(undoMock.result).toHaveBeenCalled())
  })

  it('should update logo scale', async () => {
    const journey = {
      ...defaultJourney,
      logoImageBlock: imageBlock
    }
    const updateMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        scale: 50
      },
      true
    )

    render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          updateMock
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <CommandProvider>
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() =>
      fireEvent.change(screen.getByLabelText('size-slider'), {
        target: { value: 50 }
      })
    )

    await waitFor(() => expect(updateMock.result).toHaveBeenCalled())
  })

  it('should undo logo scale update', async () => {
    const journey = {
      ...defaultJourney,
      logoImageBlock: imageBlock
    }
    const updateMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        scale: 50
      },
      true
    )
    const undoMock = getImageBlockUpdateMock(
      imageBlock.id,
      {
        scale: 1
      },
      true
    )

    render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          listUnsplashCollectionPhotosMock,
          updateMock,
          undoMock
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <CommandProvider>
            <CommandUndoItem variant="button" />
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() =>
      fireEvent.change(screen.getByLabelText('size-slider'), {
        target: { value: 50 }
      })
    )
    await waitFor(() => expect(updateMock.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(undoMock.result).toHaveBeenCalled())
  })
})
