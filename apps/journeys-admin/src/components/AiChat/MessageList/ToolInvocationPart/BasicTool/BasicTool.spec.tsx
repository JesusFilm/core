import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import { render, screen } from '@testing-library/react'

import { BasicTool } from './BasicTool'

describe('BasicTool', () => {
  describe('Call State', () => {
    const mockToolInvocationCallPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'testTool',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    it('should render shimmer typography when state is call and callText provided', () => {
      render(
        <BasicTool
          part={mockToolInvocationCallPart}
          callText="Processing your request..."
          resultText="Result text"
        />
      )

      expect(screen.getByText('Processing your request...')).toBeInTheDocument()

      const shimmerText = screen.getByText('Processing your request...')
      expect(shimmerText.tagName.toLowerCase()).toBe('span')

      expect(screen.queryByText('Result text')).not.toBeInTheDocument()
    })

    it('should return null when state is call but callText is not provided', () => {
      const { container } = render(
        <BasicTool part={mockToolInvocationCallPart} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('Result State', () => {
    const mockToolInvocationResultPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'testTool',
        args: {},
        state: 'result' as const
      }
    } as ToolInvocationUIPart

    it('should render chip when state is result and resultText provided', () => {
      render(
        <BasicTool
          part={mockToolInvocationResultPart}
          callText="Call text"
          resultText="Task completed successfully"
        />
      )

      expect(
        screen.getByText('Task completed successfully')
      ).toBeInTheDocument()

      const chip = screen
        .getByText('Task completed successfully')
        .closest('[class*="MuiChip"]')
      expect(chip).toBeInTheDocument()

      expect(screen.queryByText('Call text')).not.toBeInTheDocument()
    })

    it('should return null when state is result but resultText is not provided', () => {
      const { container } = render(
        <BasicTool part={mockToolInvocationResultPart} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('Default State', () => {
    it('should return null for unknown state', () => {
      const mockToolInvocationUnknownPart = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'testTool',
          args: {},
          state: 'unknown' as const
        }
      } as unknown as ToolInvocationUIPart

      const { container } = render(
        <BasicTool
          part={mockToolInvocationUnknownPart}
          callText="Call text"
          resultText="Result text"
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
