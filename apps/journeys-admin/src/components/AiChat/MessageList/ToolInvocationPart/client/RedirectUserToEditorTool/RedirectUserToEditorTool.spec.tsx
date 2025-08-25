import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import { fireEvent, render, screen } from '@testing-library/react'

import { ClientRedirectUserToEditorTool } from './RedirectUserToEditorTool'

// Mock next-i18next following the established pattern
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('ClientRedirectUserToEditorTool', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Call State', () => {
    const callPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientRedirectUserToEditor',
        args: {
          message: 'Click to view your journey in the editor',
          journeyId: 'journey-123'
        },
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    it('should render message and button when state is call', () => {
      render(<ClientRedirectUserToEditorTool part={callPart} />)

      expect(
        screen.getByText('Click to view your journey in the editor')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'See My Journey!' })
      ).toBeInTheDocument()
    })

    it('should navigate to journey when button is clicked', () => {
      render(<ClientRedirectUserToEditorTool part={callPart} />)

      fireEvent.click(screen.getByRole('button', { name: 'See My Journey!' }))

      expect(mockPush).toHaveBeenCalledWith('/journeys/journey-123')
    })
  })

  describe('Default State', () => {
    const unknownPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientRedirectUserToEditor',
        args: {
          message: 'Click to view your journey in the editor',
          journeyId: 'journey-123'
        },
        state: 'unknown' as any
      }
    } as unknown as ToolInvocationUIPart

    it('should return null for unknown state', () => {
      const { container } = render(
        <ClientRedirectUserToEditorTool part={unknownPart} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
