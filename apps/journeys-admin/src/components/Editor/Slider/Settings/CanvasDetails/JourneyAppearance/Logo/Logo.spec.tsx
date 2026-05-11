import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
import {
  listUnsplashCollectionPhotosMock,
  toImageBlockUpdateInput,
  triggerUnsplashDownloadMock,
  unsplashImageInput
} from '../../../Drawer/ImageBlockEditor/UnsplashGallery/data'
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
  const defaultJourney = {
    id: 'journeyId',
    __typename: 'Journey',
    logoImageBlock: null
  } as unknown as Journey

  const imageBlock: ImageBlock = {
    __typename: 'ImageBlock',
    id: 'logoImageBlockId',
    parentBlockId: null,
    src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
    alt: 'public',
    scale: 100,
    parentOrder: null,
    width: 1,
    height: 1,
    blurhash: '',
    focalLeft: 50,
    focalTop: 50,
    customizable: null
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
            ...unsplashImageInput,
            id: imageBlock.id,
            journeyId: defaultJourney.id,
            parentBlockId: null
          },
          journeyUpdateInput: {
            logoImageBlockId: imageBlock.id
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          imageBlockCreate: {
            ...imageBlock,
            ...unsplashImageInput
          },
          journeyUpdate: {
            __typename: 'Journey',
            id: defaultJourney.id,
            logoImageBlock: {
              id: imageBlock.id,
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

  it('should create logo image block from gallery selection', async () => {
    mockUuidv4.mockReturnValueOnce(imageBlock.id)
    const cache = new InMemoryCache()
    cache.restore({
      [`Journey:${defaultJourney.id}`]: {
        blocks: [],
        id: defaultJourney.id,
        __typename: 'Journey'
      }
    })
    const createLogoMock = getLogoImageBlockCreateMock()
    const undoMock = getImageBlockUpdateMock(imageBlock.id, {
      src: null
    })
    const redoMock = getImageBlockUpdateMock(imageBlock.id, {
      src: unsplashImageInput.src
    })

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          listUnsplashCollectionPhotosMock,
          triggerUnsplashDownloadMock,
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
    await waitFor(() =>
      expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByTestId('image-dLAN46E5wVw').querySelector('button') as Element
    )

    await waitFor(() => expect(createLogoMock.result).toHaveBeenCalled())
    expect(cache.extract()[`Journey:${defaultJourney.id}`]?.blocks).toEqual([
      { __ref: `ImageBlock:${imageBlock.id}` }
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoMock.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoMock.result).toHaveBeenCalled())
  })

  it('should update logo image from gallery selection', async () => {
    const journey = {
      ...defaultJourney,
      logoImageBlock: imageBlock
    }
    const undoInput = toImageBlockUpdateInput(imageBlock)
    const updateMock = getImageBlockUpdateMock(
      imageBlock.id,
      unsplashImageInput,
      true
    )
    const redoMock = getImageBlockUpdateMock(
      imageBlock.id,
      unsplashImageInput,
      true
    )
    const undoMock = getImageBlockUpdateMock(imageBlock.id, undoInput, true)

    const cache = new InMemoryCache()
    cache.restore({
      [`ImageBlock:${imageBlock.id}`]: { ...imageBlock }
    })

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          listUnsplashCollectionPhotosMock,
          triggerUnsplashDownloadMock,
          updateMock,
          undoMock,
          redoMock
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <CommandProvider>
            <Logo />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() => fireEvent.click(screen.getByTestId('card click area')))
    await waitFor(() =>
      expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByTestId('image-dLAN46E5wVw').querySelector('button') as Element
    )

    await waitFor(() => expect(updateMock.result).toHaveBeenCalled())
    expect(cache.extract()[`ImageBlock:${imageBlock.id}`]?.src).toEqual(
      unsplashImageInput.src
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoMock.result).toHaveBeenCalled())
    expect(cache.extract()[`ImageBlock:${imageBlock.id}`]?.src).toEqual(
      imageBlock.src
    )
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoMock.result).toHaveBeenCalled())
    expect(cache.extract()[`ImageBlock:${imageBlock.id}`]?.src).toEqual(
      unsplashImageInput.src
    )
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
        mocks={[listUnsplashCollectionPhotosMock, deleteMock, undoMock]}
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
})
