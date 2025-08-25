import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import { fireEvent, render, screen } from '@testing-library/react'

import { ClientSelectImageTool } from './SelectImageTool'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('next/image', () => {
  return function MockedImage({ src, alt, width, height, onClick }: any) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onClick={onClick}
        data-testid="generated-image"
      />
    )
  }
})

jest.mock('../../../../../Editor/Slider/Settings/Drawer/ImageLibrary', () => ({
  ImageLibrary: function MockedImageLibrary({ open, onClose, onChange }: any) {
    return (
      <div
        data-testid="image-library"
        style={{ display: open ? 'block' : 'none' }}
      >
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onChange({ src: 'selected-image.jpg' })}>
          Select Image
        </button>
      </div>
    )
  }
}))

describe('ClientSelectImageTool', () => {
  const mockAddToolResult = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Call State', () => {
    const callPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientSelectImage',
        args: {
          message: 'Select an image for your block',
          generatedImageUrls: [
            'https://example.com/image1.png',
            'https://example.com/image2.png'
          ]
        },
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    it('should render message and buttons when state is call', () => {
      render(
        <ClientSelectImageTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(
        screen.getByText('Select an image for your block')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Open Image Library' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should render generated images when provided', () => {
      render(
        <ClientSelectImageTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )

      const images = screen.getAllByTestId('generated-image')
      expect(images).toHaveLength(2)
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.png')
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.png')
    })

    it('should call addToolResult when generated image is clicked', () => {
      render(
        <ClientSelectImageTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )

      const firstImage = screen.getAllByTestId('generated-image')[0]
      fireEvent.click(firstImage)

      expect(mockAddToolResult).toHaveBeenCalledWith({
        toolCallId: 'test-id',
        result:
          'update the image block to use this url: https://example.com/image1.png'
      })
    })

    it('should open image library when button is clicked', () => {
      render(
        <ClientSelectImageTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByTestId('image-library')).not.toBeVisible()

      fireEvent.click(
        screen.getByRole('button', { name: 'Open Image Library' })
      )

      expect(screen.getByTestId('image-library')).toBeVisible()
    })

    it('should call addToolResult when cancel button is clicked', () => {
      render(
        <ClientSelectImageTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(mockAddToolResult).toHaveBeenCalledWith({
        toolCallId: 'test-id',
        result: { cancelled: true }
      })
    })

    it('should call addToolResult when image is selected from library', () => {
      render(
        <ClientSelectImageTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'Open Image Library' })
      )
      fireEvent.click(screen.getByText('Select Image'))

      expect(mockAddToolResult).toHaveBeenCalledWith({
        toolCallId: 'test-id',
        result:
          'update the image block using this object: {"src":"selected-image.jpg"}'
      })
    })
  })

  describe('Default State', () => {
    const unknownPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientSelectImage',
        args: {
          message: 'Select an image for your block'
        },
        state: 'unknown' as any
      }
    } as unknown as ToolInvocationUIPart

    it('should return null for unknown state', () => {
      const { container } = render(
        <ClientSelectImageTool
          part={unknownPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
