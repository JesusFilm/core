import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import {
  ImageBlockUpdate,
  ImageBlockUpdateVariables
} from '../../../../../../../../../__generated__/ImageBlockUpdate'
import {
  VideoBlockUpdate,
  VideoBlockUpdateVariables
} from '../../../../../../../../../__generated__/VideoBlockUpdate'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'
import { IMAGE_BLOCK_UPDATE } from '../../blocks/Image/Options/ImageOptions'
import { VIDEO_BLOCK_UPDATE } from '../../blocks/Video/Options/VideoOptions'

import { BlockCustomizationToggle } from './BlockCustomizationToggle'

const imageBlock: TreeBlock<ImageBlock> = {
  __typename: 'ImageBlock',
  id: 'imageBlockId',
  parentBlockId: 'parentBlockId',
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'alt text',
  width: 1920,
  height: 1080,
  blurhash: '',
  scale: null,
  focalTop: null,
  focalLeft: null,
  customizable: false,
  children: []
}

const videoBlock: TreeBlock<VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'videoBlockId',
  parentBlockId: 'parentBlockId',
  parentOrder: 0,
  muted: null,
  autoplay: null,
  startAt: null,
  endAt: null,
  posterBlockId: null,
  fullsize: null,
  videoId: null,
  videoVariantLanguageId: null,
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  image: null,
  duration: null,
  objectFit: null,
  showGeneratedSubtitles: null,
  subtitleLanguage: null,
  mediaVideo: null,
  action: null,
  eventLabel: null,
  endEventLabel: null,
  customizable: false,
  children: []
}

describe('BlockCustomizationToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders toggle for ImageBlock and reflects checked state when customizable is true', () => {
      const blockWithCustomizableTrue = {
        ...imageBlock,
        customizable: true
      }
      render(
        <MockedProvider mocks={[]}>
          <CommandProvider>
            <BlockCustomizationToggle block={blockWithCustomizableTrue} />
          </CommandProvider>
        </MockedProvider>
      )

      expect(screen.getByText('Needs Customization')).toBeInTheDocument()
      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      expect(toggle).toBeChecked()
      expect(toggle).not.toBeDisabled()
    })

    it('renders toggle for ImageBlock and reflects unchecked state when customizable is false', () => {
      render(
        <MockedProvider mocks={[]}>
          <CommandProvider>
            <BlockCustomizationToggle block={imageBlock} />
          </CommandProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      expect(toggle).not.toBeChecked()
    })

    it('renders toggle for ImageBlock when customizable is null', () => {
      const blockWithNullCustomizable = {
        ...imageBlock,
        customizable: null
      }
      render(
        <MockedProvider mocks={[]}>
          <CommandProvider>
            <BlockCustomizationToggle block={blockWithNullCustomizable} />
          </CommandProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      expect(toggle).not.toBeChecked()
    })

    it('renders toggle for VideoBlock and reflects checked state when customizable is true', () => {
      const blockWithCustomizableTrue = {
        ...videoBlock,
        customizable: true
      }
      render(
        <MockedProvider mocks={[]}>
          <CommandProvider>
            <BlockCustomizationToggle block={blockWithCustomizableTrue} />
          </CommandProvider>
        </MockedProvider>
      )

      expect(screen.getByText('Needs Customization')).toBeInTheDocument()
      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      expect(toggle).toBeChecked()
      expect(toggle).not.toBeDisabled()
    })

    it('renders toggle for VideoBlock and reflects unchecked state when customizable is false', () => {
      render(
        <MockedProvider mocks={[]}>
          <CommandProvider>
            <BlockCustomizationToggle block={videoBlock} />
          </CommandProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      expect(toggle).not.toBeChecked()
    })

    it('renders toggle when block prop is undefined - unchecked and disabled', () => {
      render(
        <MockedProvider mocks={[]}>
          <CommandProvider>
            <BlockCustomizationToggle block={undefined} />
          </CommandProvider>
        </MockedProvider>
      )

      expect(screen.getByText('Needs Customization')).toBeInTheDocument()
      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      expect(toggle).not.toBeChecked()
      expect(toggle).toBeDisabled()
    })

    describe('helper text when disabled', () => {
      it('shows image helper text when block is undefined and mediaTypeWhenEmpty is image', () => {
        render(
          <MockedProvider mocks={[]}>
            <CommandProvider>
              <BlockCustomizationToggle
                block={undefined}
                mediaTypeWhenEmpty="image"
              />
            </CommandProvider>
          </MockedProvider>
        )

        expect(
          screen.getByText('Select an image to make this customizable')
        ).toBeInTheDocument()
      })

      it('shows video helper text when block is undefined and mediaTypeWhenEmpty is video', () => {
        render(
          <MockedProvider mocks={[]}>
            <CommandProvider>
              <BlockCustomizationToggle
                block={undefined}
                mediaTypeWhenEmpty="video"
              />
            </CommandProvider>
          </MockedProvider>
        )

        expect(
          screen.getByText('Select a video to make this customizable')
        ).toBeInTheDocument()
      })
    })
  })

  describe('mutations', () => {
    it('ImageBlock: toggling on calls imageBlockUpdate with customizable true', async () => {
      const imageBlockUpdateResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: { ...imageBlock, customizable: true }
        }
      }))
      const imageBlockUpdateMock: MockedResponse<
        ImageBlockUpdate,
        ImageBlockUpdateVariables
      > = {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: imageBlock.id,
            input: {
              customizable: true,
              src: imageBlock.src,
              width: 1920,
              height: 1080,
              blurhash: ''
            }
          }
        },
        result: imageBlockUpdateResult
      }

      render(
        <MockedProvider mocks={[imageBlockUpdateMock]}>
          <CommandProvider>
            <BlockCustomizationToggle block={imageBlock} />
          </CommandProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(imageBlockUpdateResult).toHaveBeenCalled()
      })
    })

    it('ImageBlock: toggling off calls imageBlockUpdate with customizable false', async () => {
      const blockWithCustomizable = { ...imageBlock, customizable: true }
      const imageBlockUpdateResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: { ...blockWithCustomizable, customizable: false }
        }
      }))
      const imageBlockUpdateMock: MockedResponse<
        ImageBlockUpdate,
        ImageBlockUpdateVariables
      > = {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: imageBlock.id,
            input: {
              customizable: false,
              src: imageBlock.src,
              width: 1920,
              height: 1080,
              blurhash: ''
            }
          }
        },
        result: imageBlockUpdateResult
      }

      render(
        <MockedProvider mocks={[imageBlockUpdateMock]}>
          <CommandProvider>
            <BlockCustomizationToggle block={blockWithCustomizable} />
          </CommandProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(imageBlockUpdateResult).toHaveBeenCalled()
      })
    })

    it('VideoBlock: toggling on calls videoBlockUpdate with customizable true', async () => {
      const videoBlockUpdateResult = jest.fn(() => ({
        data: {
          videoBlockUpdate: { ...videoBlock, customizable: true }
        }
      }))
      const videoBlockUpdateMock: MockedResponse<
        VideoBlockUpdate,
        VideoBlockUpdateVariables
      > = {
        request: {
          query: VIDEO_BLOCK_UPDATE,
          variables: {
            id: videoBlock.id,
            input: { customizable: true }
          }
        },
        result: videoBlockUpdateResult
      }

      render(
        <MockedProvider mocks={[videoBlockUpdateMock]}>
          <CommandProvider>
            <BlockCustomizationToggle block={videoBlock} />
          </CommandProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(videoBlockUpdateResult).toHaveBeenCalled()
      })
    })

    it('VideoBlock: toggling off calls videoBlockUpdate with customizable false', async () => {
      const blockWithCustomizable = { ...videoBlock, customizable: true }
      const videoBlockUpdateResult = jest.fn(() => ({
        data: {
          videoBlockUpdate: { ...blockWithCustomizable, customizable: false }
        }
      }))
      const videoBlockUpdateMock: MockedResponse<
        VideoBlockUpdate,
        VideoBlockUpdateVariables
      > = {
        request: {
          query: VIDEO_BLOCK_UPDATE,
          variables: {
            id: videoBlock.id,
            input: { customizable: false }
          }
        },
        result: videoBlockUpdateResult
      }

      render(
        <MockedProvider mocks={[videoBlockUpdateMock]}>
          <CommandProvider>
            <BlockCustomizationToggle block={blockWithCustomizable} />
          </CommandProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(videoBlockUpdateResult).toHaveBeenCalled()
      })
    })
  })

  describe('undo / redo', () => {
    it('undo after toggling ImageBlock customizable calls imageBlockUpdate with customizable false', async () => {
      const executeResult = jest.fn(() => ({
        data: { imageBlockUpdate: { ...imageBlock, customizable: true } }
      }))
      const undoResult = jest.fn(() => ({
        data: { imageBlockUpdate: { ...imageBlock, customizable: false } }
      }))
      const executeMock: MockedResponse<
        ImageBlockUpdate,
        ImageBlockUpdateVariables
      > = {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: imageBlock.id,
            input: {
              customizable: true,
              src: imageBlock.src,
              width: 1920,
              height: 1080,
              blurhash: ''
            }
          }
        },
        result: executeResult
      }
      const undoMock: MockedResponse<
        ImageBlockUpdate,
        ImageBlockUpdateVariables
      > = {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: imageBlock.id,
            input: {
              customizable: false,
              src: imageBlock.src,
              width: 1920,
              height: 1080,
              blurhash: ''
            }
          }
        },
        result: undoResult
      }

      render(
        <MockedProvider mocks={[executeMock, undoMock]}>
          <CommandProvider>
            <BlockCustomizationToggle block={imageBlock} />
            <CommandUndoItem variant="button" />
          </CommandProvider>
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      )
      await waitFor(() => expect(executeResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())
    })

    it('redo after undo for ImageBlock calls imageBlockUpdate with customizable true', async () => {
      const executeResult = jest.fn(() => ({
        data: { imageBlockUpdate: { ...imageBlock, customizable: true } }
      }))
      const undoResult = jest.fn(() => ({
        data: { imageBlockUpdate: { ...imageBlock, customizable: false } }
      }))
      const redoResult = jest.fn(() => ({
        data: { imageBlockUpdate: { ...imageBlock, customizable: true } }
      }))
      const executeMock: MockedResponse<
        ImageBlockUpdate,
        ImageBlockUpdateVariables
      > = {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: imageBlock.id,
            input: {
              customizable: true,
              src: imageBlock.src,
              width: 1920,
              height: 1080,
              blurhash: ''
            }
          }
        },
        result: executeResult
      }
      const undoMock: MockedResponse<
        ImageBlockUpdate,
        ImageBlockUpdateVariables
      > = {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: imageBlock.id,
            input: {
              customizable: false,
              src: imageBlock.src,
              width: 1920,
              height: 1080,
              blurhash: ''
            }
          }
        },
        result: undoResult
      }
      const redoMock: MockedResponse<
        ImageBlockUpdate,
        ImageBlockUpdateVariables
      > = {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: imageBlock.id,
            input: {
              customizable: true,
              src: imageBlock.src,
              width: 1920,
              height: 1080,
              blurhash: ''
            }
          }
        },
        result: redoResult
      }

      render(
        <MockedProvider mocks={[executeMock, undoMock, redoMock]}>
          <CommandProvider>
            <BlockCustomizationToggle block={imageBlock} />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </CommandProvider>
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      )
      await waitFor(() => expect(executeResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(redoResult).toHaveBeenCalled())
    })

    it('undo after toggling VideoBlock customizable calls videoBlockUpdate with customizable false', async () => {
      const executeResult = jest.fn(() => ({
        data: { videoBlockUpdate: { ...videoBlock, customizable: true } }
      }))
      const undoResult = jest.fn(() => ({
        data: { videoBlockUpdate: { ...videoBlock, customizable: false } }
      }))
      const executeMock: MockedResponse<
        VideoBlockUpdate,
        VideoBlockUpdateVariables
      > = {
        request: {
          query: VIDEO_BLOCK_UPDATE,
          variables: {
            id: videoBlock.id,
            input: { customizable: true }
          }
        },
        result: executeResult
      }
      const undoMock: MockedResponse<
        VideoBlockUpdate,
        VideoBlockUpdateVariables
      > = {
        request: {
          query: VIDEO_BLOCK_UPDATE,
          variables: {
            id: videoBlock.id,
            input: { customizable: false }
          }
        },
        result: undoResult
      }

      render(
        <MockedProvider mocks={[executeMock, undoMock]}>
          <CommandProvider>
            <BlockCustomizationToggle block={videoBlock} />
            <CommandUndoItem variant="button" />
          </CommandProvider>
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      )
      await waitFor(() => expect(executeResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())
    })

    it('redo after undo for VideoBlock calls videoBlockUpdate with customizable true', async () => {
      const executeResult = jest.fn(() => ({
        data: { videoBlockUpdate: { ...videoBlock, customizable: true } }
      }))
      const undoResult = jest.fn(() => ({
        data: { videoBlockUpdate: { ...videoBlock, customizable: false } }
      }))
      const redoResult = jest.fn(() => ({
        data: { videoBlockUpdate: { ...videoBlock, customizable: true } }
      }))
      const executeMock: MockedResponse<
        VideoBlockUpdate,
        VideoBlockUpdateVariables
      > = {
        request: {
          query: VIDEO_BLOCK_UPDATE,
          variables: {
            id: videoBlock.id,
            input: { customizable: true }
          }
        },
        result: executeResult
      }
      const undoMock: MockedResponse<
        VideoBlockUpdate,
        VideoBlockUpdateVariables
      > = {
        request: {
          query: VIDEO_BLOCK_UPDATE,
          variables: {
            id: videoBlock.id,
            input: { customizable: false }
          }
        },
        result: undoResult
      }
      const redoMock: MockedResponse<
        VideoBlockUpdate,
        VideoBlockUpdateVariables
      > = {
        request: {
          query: VIDEO_BLOCK_UPDATE,
          variables: {
            id: videoBlock.id,
            input: { customizable: true }
          }
        },
        result: redoResult
      }

      render(
        <MockedProvider mocks={[executeMock, undoMock, redoMock]}>
          <CommandProvider>
            <BlockCustomizationToggle block={videoBlock} />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </CommandProvider>
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      )
      await waitFor(() => expect(executeResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(redoResult).toHaveBeenCalled())
    })
  })
})
