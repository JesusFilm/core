import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import { fireEvent, render, screen } from '@testing-library/react'

import { ClientSelectVideoTool } from './SelectVideoTool'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../../../Editor/Slider/Settings/Drawer/VideoLibrary', () => ({
  VideoLibrary: function MockedVideoLibrary({ open, onClose, onSelect }: any) {
    return (
      <div
        data-testid="video-library"
        style={{ display: open ? 'block' : 'none' }}
      >
        <button onClick={() => onClose()}>Close</button>
        <button
          onClick={() =>
            onSelect({ videoId: 'selected-video', title: 'Test Video' })
          }
        >
          Select Video
        </button>
      </div>
    )
  }
}))

describe('ClientSelectVideoTool', () => {
  const mockAddToolResult = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Call State', () => {
    const callPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientSelectVideo',
        args: {
          message: 'Select a video for your block'
        },
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    it('should render message and buttons when state is call', () => {
      render(
        <ClientSelectVideoTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(
        screen.getByText('Select a video for your block')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Open Video Library' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should open video library when button is clicked', () => {
      render(
        <ClientSelectVideoTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )
      expect(screen.getByTestId('video-library')).not.toBeVisible()

      fireEvent.click(
        screen.getByRole('button', { name: 'Open Video Library' })
      )

      expect(screen.getByTestId('video-library')).toBeVisible()
    })

    it('should call addToolResult when cancel button is clicked', () => {
      render(
        <ClientSelectVideoTool
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

    it('should call addToolResult when video is selected from library', () => {
      render(
        <ClientSelectVideoTool
          part={callPart}
          addToolResult={mockAddToolResult}
        />
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'Open Video Library' })
      )
      fireEvent.click(screen.getByText('Select Video'))

      expect(mockAddToolResult).toHaveBeenCalledWith({
        toolCallId: 'test-id',
        result:
          'here is the video: {"videoId":"selected-video","title":"Test Video"}'
      })
    })
  })

  describe('Default State', () => {
    const unknownPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientSelectVideo',
        args: {
          message: 'Select a video for your block'
        },
        state: 'unknown' as any
      }
    } as unknown as ToolInvocationUIPart

    it('should return null for unknown state', () => {
      const { container } = render(
        <ClientSelectVideoTool
          part={unknownPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
