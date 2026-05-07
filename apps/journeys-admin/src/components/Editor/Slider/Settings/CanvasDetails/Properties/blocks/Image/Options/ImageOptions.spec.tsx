import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ImageBlockUpdate,
  ImageBlockUpdateVariables
} from '../../../../../../../../../../__generated__/ImageBlockUpdate'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'
import {
  listUnsplashCollectionPhotosMock,
  triggerUnsplashDownloadMock
} from '../../../../../Drawer/ImageBlockEditor/UnsplashGallery/data'

import { IMAGE_BLOCK_UPDATE } from './ImageOptions'

import { ImageOptions } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageOptions', () => {
  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
  })

  const selectedBlock: TreeBlock<ImageBlock> = {
    __typename: 'ImageBlock',
    id: 'imageBlockId',
    parentBlockId: 'parentBlockId',
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

  const response: ImageBlockUpdate = {
    imageBlockUpdate: {
      ...selectedBlock
    }
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

  const scaleUpdateResponse: ImageBlockUpdate = {
    imageBlockUpdate: {
      ...selectedBlock,
      scale: 150
    }
  }

  const imageBlockUpdateMock: MockedResponse<
    ImageBlockUpdate,
    ImageBlockUpdateVariables
  > = {
    request: {
      query: IMAGE_BLOCK_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          src: selectedBlock.src,
          alt: selectedBlock.alt
        }
      }
    },
    result: {
      data: response
    }
  }

  it('updates image block from gallery selection', async () => {
    const updateResult = jest.fn(() => ({
      data: {
        imageBlockUpdate: {
          ...selectedBlock,
          ...unsplashImageInput
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          listUnsplashCollectionPhotosMock,
          triggerUnsplashDownloadMock,
          {
            request: {
              query: IMAGE_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: unsplashImageInput
              }
            },
            result: updateResult
          }
        ]}
      >
        <CommandProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ImageOptions />
          </EditorProvider>
        </CommandProvider>
      </MockedProvider>
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'public Selected Image 1920 x 1080 pixels'
      })
    )
    await waitFor(() =>
      expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'white dome building during daytime' })
    )

    await waitFor(() => expect(updateResult).toHaveBeenCalled())
  })

  it('fake delete image block', async () => {
    const deleteResult = jest.fn(() => ({
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
          listUnsplashCollectionPhotosMock,
          {
            ...imageBlockUpdateMock,
            request: {
              ...imageBlockUpdateMock.request,
              variables: {
                ...imageBlockUpdateMock.request.variables,
                input: {
                  ...imageBlockUpdateMock.request.variables?.input,
                  src: null,
                  alt: ''
                }
              }
            },
            result: deleteResult
          },
          {
            ...imageBlockUpdateMock,
            result: undoResult
          },
          {
            ...imageBlockUpdateMock,
            request: {
              ...imageBlockUpdateMock.request,
              variables: {
                ...imageBlockUpdateMock.request.variables,
                input: {
                  ...imageBlockUpdateMock.request.variables?.input,
                  src: null,
                  alt: ''
                }
              }
            },
            result: redoResult
          }
        ]}
      >
        <CommandProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ImageOptions />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </CommandProvider>
      </MockedProvider>
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'public Selected Image 1920 x 1080 pixels'
      })
    )
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('imageBlockHeaderDelete'))
    )
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoResult).toHaveBeenCalled())
  })

  it('update image block scale', async () => {
    const zoomUpdateResult = jest.fn(() => ({
      data: scaleUpdateResponse
    }))
    const undoResult = jest.fn(() => ({
      data: response
    }))
    const redoResult = jest.fn(() => ({
      data: scaleUpdateResponse
    }))

    const zoomUpdateMock: MockedResponse<
      ImageBlockUpdate,
      ImageBlockUpdateVariables
    > = {
      request: {
        query: IMAGE_BLOCK_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            src: selectedBlock.src,
            scale: 150
          }
        }
      },
      result: zoomUpdateResult
    }

    render(
      <MockedProvider
        mocks={[
          zoomUpdateMock,
          {
            ...zoomUpdateMock,
            request: {
              ...zoomUpdateMock.request,
              variables: {
                ...zoomUpdateMock.request.variables,
                input: {
                  ...zoomUpdateMock.request.variables?.input,
                  scale: null
                }
              }
            },
            result: undoResult
          },
          {
            ...zoomUpdateMock,
            result: redoResult
          }
        ]}
      >
        <CommandProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ImageOptions />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </CommandProvider>
      </MockedProvider>
    )

    const zoomSlider = screen.getByRole('slider', { name: 'Zoom slider' })
    expect(screen.getByText('1.0 ×')).toBeInTheDocument()
    expect(zoomSlider).toHaveValue('1')

    fireEvent.change(zoomSlider, { target: { value: 1.5 } })
    fireEvent.mouseUp(zoomSlider)
    await waitFor(() => {
      expect(zoomUpdateResult).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoResult).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoResult).toHaveBeenCalled())
  })
})
