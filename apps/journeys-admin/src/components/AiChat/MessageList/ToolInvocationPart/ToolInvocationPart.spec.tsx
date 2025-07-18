import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import { render, screen } from '@testing-library/react'

import { ToolInvocationPart } from './ToolInvocationPart'

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
        data-testid="next-image"
      />
    )
  }
})

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

jest.mock('../../../Editor/Slider/Settings/Drawer/ImageLibrary', () => ({
  ImageLibrary: function MockedImageLibrary({ open }: any) {
    return (
      <div
        data-testid="image-library"
        style={{ display: open ? 'block' : 'none' }}
      />
    )
  }
}))

jest.mock('../../../Editor/Slider/Settings/Drawer/VideoLibrary', () => ({
  VideoLibrary: function MockedVideoLibrary({ open }: any) {
    return (
      <div
        data-testid="video-library"
        style={{ display: open ? 'block' : 'none' }}
      />
    )
  }
}))

describe('ToolInvocationPart', () => {
  const mockAddToolResult = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('BasicTool Cases', () => {
    const agentWebSearchPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'agentWebSearch',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const journeySimpleGetPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'journeySimpleGet',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const journeySimpleUpdatePart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'journeySimpleUpdate',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    it('should render BasicTool for agentWebSearch with shimmer text', () => {
      render(
        <ToolInvocationPart
          part={agentWebSearchPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Searching the web...')).toBeInTheDocument()
    })

    it('should render BasicTool for journeySimpleGet with shimmer text', () => {
      render(
        <ToolInvocationPart
          part={journeySimpleGetPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Getting journey...')).toBeInTheDocument()
    })

    it('should render BasicTool for journeySimpleUpdate with shimmer text', () => {
      render(
        <ToolInvocationPart
          part={journeySimpleUpdatePart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Updating journey...')).toBeInTheDocument()
    })

    it('should render BasicTool result state for journeySimpleGet', () => {
      const journeySimpleGetResultPart = {
        ...journeySimpleGetPart,
        toolInvocation: {
          ...journeySimpleGetPart.toolInvocation,
          state: 'result' as const
        }
      } as ToolInvocationUIPart

      render(
        <ToolInvocationPart
          part={journeySimpleGetResultPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Journey retrieved')).toBeInTheDocument()
      expect(screen.queryByText('Getting journey...')).not.toBeInTheDocument()
    })
  })

  describe('Client Tool Cases', () => {
    const clientSelectImagePart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientSelectImage',
        args: {
          message: 'Select an image'
        },
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const clientRedirectUserToEditorPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientRedirectUserToEditor',
        args: {
          message: 'Click to view your journey',
          journeyId: 'journey-123'
        },
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const clientSelectVideoPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientSelectVideo',
        args: {
          message: 'Select a video'
        },
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const clientRequestFormPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientRequestForm',
        args: {
          formItems: [
            {
              type: 'text',
              name: 'title',
              label: 'Title',
              required: true,
              helperText: 'Enter a title for your content'
            }
          ]
        },
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    it('should render ClientSelectImageTool with message and buttons', () => {
      render(
        <ToolInvocationPart
          part={clientSelectImagePart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Select an image')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Open Image Library' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should render ClientRedirectUserToEditorTool with message and button', () => {
      render(
        <ToolInvocationPart
          part={clientRedirectUserToEditorPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Click to view your journey')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'See My Journey!' })
      ).toBeInTheDocument()
    })

    it('should render ClientSelectVideoTool with message and buttons', () => {
      render(
        <ToolInvocationPart
          part={clientSelectVideoPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Select a video')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Open Video Library' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should render RequestFormTool with form fields', () => {
      render(
        <ToolInvocationPart
          part={clientRequestFormPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByLabelText('Title')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Submit form' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Cancel form' })
      ).toBeInTheDocument()
    })
  })

  describe('Agent Tool Cases', () => {
    const agentGenerateImagePart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'agentGenerateImage',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const agentGenerateImageResultPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'agentGenerateImage',
        args: {},
        state: 'result' as const,
        result: [
          {
            url: 'https://example.com/generated.png',
            width: 256,
            height: 256,
            blurhash: 'blurhash'
          }
        ]
      }
    } as ToolInvocationUIPart

    it('should render AgentGenerateImageTool in call state', () => {
      render(
        <ToolInvocationPart
          part={agentGenerateImagePart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Generating image...')).toBeInTheDocument()
    })

    it('should render AgentGenerateImageTool in result state with images', () => {
      render(
        <ToolInvocationPart
          part={agentGenerateImageResultPart}
          addToolResult={mockAddToolResult}
        />
      )

      const image = screen.getByTestId('next-image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/generated.png')
      expect(image).toHaveAttribute('alt', 'Generated image')
      expect(image).toHaveAttribute('width', '256')
      expect(image).toHaveAttribute('height', '256')
    })
  })

  describe('Default Case', () => {
    const unknownToolPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'unknownTool',
        args: {},
        state: 'call' as const
      }
    } as unknown as ToolInvocationUIPart

    it('should return null for unknown tool name', () => {
      const { container } = render(
        <ToolInvocationPart
          part={unknownToolPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
