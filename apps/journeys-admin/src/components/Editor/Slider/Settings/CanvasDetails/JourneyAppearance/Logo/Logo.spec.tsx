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
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'
import {
  listUnsplashCollectionPhotosMock,
  triggerUnsplashDownloadMock
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

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          listUnsplashCollectionPhotosMock,
          triggerUnsplashDownloadMock,
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
        mocks={[
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
})
