import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import {
  ImageBlockUpdate,
  ImageBlockUpdateVariables
} from '../../../../../../../../__generated__/ImageBlockUpdate'
import { LogoBlockCreate_imageBlockCreate as ImageBlock } from '../../../../../../../../__generated__/LogoBlockCreate'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'
import { listUnsplashCollectionPhotosMock } from '../../../Drawer/ImageBlockEditor/UnsplashGallery/data'
import { IMAGE_BLOCK_UPDATE } from '../../Properties/blocks/Image/Options/ImageOptions'

import { Logo } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

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
