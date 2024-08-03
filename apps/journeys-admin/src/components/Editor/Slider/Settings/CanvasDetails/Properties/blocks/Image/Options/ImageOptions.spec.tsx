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
import { createCloudflareUploadByUrlMock } from '../../../../../Drawer/ImageBlockEditor/CustomImage/CustomUrl/data'

import { IMAGE_BLOCK_UPDATE } from './ImageOptions'

import { ImageOptions } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageOptions', () => {
  let originalEnv

  beforeEach(() => {
    (useMediaQuery as jest.Mock).mockImplementation(() => true)
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
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
    children: []
  }

  const response: ImageBlockUpdate = {
    imageBlockUpdate: {
      ...selectedBlock
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

  it('updates image block', async () => {
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
          createCloudflareUploadByUrlMock,
          {
            ...imageBlockUpdateMock,
            result: updateResult
          },
          {
            ...imageBlockUpdateMock,
            request: {
              ...imageBlockUpdateMock.request,
              variables: {
                ...imageBlockUpdateMock.request.variables,
                input: {
                  ...imageBlockUpdateMock.request.variables?.input,
                  src: 'https://example.com/old.jpg',
                  alt: 'prior-alt'
                }
              }
            },
            result: undoResult
          },
          {
            ...imageBlockUpdateMock,
            result: redoResult
          }
        ]}
      >
        <CommandProvider>
          <EditorProvider
            initialState={{
              selectedBlock: {
                ...selectedBlock,
                src: 'https://example.com/old.jpg',
                alt: 'prior-alt'
              }
            }}
          >
            <ImageOptions />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </CommandProvider>
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
      fireEvent.click(screen.getByRole('button', { name: 'Add image by URL' }))
    )
    const textBox = screen.getByRole('textbox')
    fireEvent.change(textBox, {
      target: {
        value: 'https://example.com/image.jpg'
      }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(updateResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoResult).toHaveBeenCalled())
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
})
