import { Message } from '@ai-sdk/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MessageList } from './MessageList'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn()
  })
}))

jest.mock('../../../libs/ai/langfuse/client', () => ({
  langfuseWeb: {
    score: jest.fn().mockResolvedValue({})
  }
}))

jest.mock('../../Editor/Slider/Settings/Drawer/ImageLibrary', () => ({
  ImageLibrary: function MockImageLibrary() {
    return <div data-testid="image-library">Image Library</div>
  }
}))

jest.mock(
  'next/image',
  () =>
    function MockImage({ alt, ...props }: any) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img alt={alt} {...props} data-testid="next-image" />
    }
)

describe('MessageList', () => {
  const mockAddToolResult = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Empty State', () => {
    it('should render empty component when no messages provided', () => {
      const { container } = render(
        <MessageList
          status="ready"
          messages={[]}
          addToolResult={mockAddToolResult}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Message Filtering', () => {
    it('should filter out system messages', () => {
      const messages = [
        {
          id: '1',
          role: 'system' as const,
          content: 'System message',
          parts: [{ type: 'text' as const, text: 'System message' }]
        },
        {
          id: '2',
          role: 'user' as const,
          content: 'User message',
          parts: [{ type: 'text' as const, text: 'User message' }]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.queryByText('System message')).not.toBeInTheDocument()
      expect(screen.getByText('User message')).toBeInTheDocument()
    })
  })

  describe('Message Order', () => {
    it('should render messages in reverse order (newest at bottom)', () => {
      const messages = [
        {
          id: '1',
          role: 'user' as const,
          content: 'First message',
          parts: [{ type: 'text' as const, text: 'First message' }]
        },
        {
          id: '2',
          role: 'assistant' as const,
          content: 'Second message',
          parts: [{ type: 'text' as const, text: 'Second message' }]
        },
        {
          id: '3',
          role: 'user' as const,
          content: 'Third message',
          parts: [{ type: 'text' as const, text: 'Third message' }]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      const messageElements = screen.getAllByText(/message/)
      const messageTexts = messageElements.map((el) => el.textContent)

      // Messages should appear in reverse order
      expect(messageTexts).toEqual([
        'Third message',
        'Second message',
        'First message'
      ])
    })
  })

  describe('Text Part Rendering', () => {
    it('should render user text messages with correct styling', () => {
      const messages = [
        {
          id: '1',
          role: 'user' as const,
          content: 'Hello AI!',
          parts: [{ type: 'text' as const, text: 'Hello AI!' }]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      const messageBox = screen.getByText('Hello AI!').closest('div')
      expect(messageBox).toHaveClass('text-part')
    })

    it('should render assistant text messages as markdown', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '**Bold text** and *italic text*',
          parts: [
            { type: 'text' as const, text: '**Bold text** and *italic text*' }
          ]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Bold text')).toBeInTheDocument()
      expect(screen.getByText('italic text')).toBeInTheDocument()
    })
  })

  describe('Tool Invocation Part Rendering', () => {
    it('should render basic tool invocation in call state', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-invocation' as const,
              toolInvocation: {
                toolCallId: 'test-id',
                toolName: 'agentWebSearch',
                args: { query: 'test search' },
                state: 'call' as const
              }
            }
          ]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Searching the web...')).toBeInTheDocument()
    })

    it('should render journey tool invocation with result state', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-invocation' as const,
              toolInvocation: {
                toolCallId: 'test-id',
                toolName: 'journeySimpleUpdate',
                args: { journeyId: 'journey-123' },
                state: 'result' as const,
                result: { success: true }
              }
            }
          ]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Journey updated')).toBeInTheDocument()
    })

    it('should render client form tool and handle submission', async () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-invocation' as const,
              toolInvocation: {
                toolCallId: 'form-test-id',
                toolName: 'clientRequestForm',
                args: {
                  formItems: [
                    {
                      name: 'title',
                      label: 'Journey Title',
                      type: 'text',
                      required: true,
                      placeholder: 'Enter title',
                      helperText: 'Please enter a title for your journey'
                    }
                  ]
                },
                state: 'call' as const
              }
            }
          ]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByLabelText('Journey Title')).toBeInTheDocument()

      // Fill and submit form
      const titleInput = screen.getByLabelText('Journey Title')
      await userEvent.type(titleInput, 'My Test Journey')

      const submitButton = screen.getByRole('button', { name: 'Submit form' })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddToolResult).toHaveBeenCalledWith({
          toolCallId: 'form-test-id',
          result: { title: 'My Test Journey' }
        })
      })
    })

    it('should render client select image tool', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-invocation' as const,
              toolInvocation: {
                toolCallId: 'image-test-id',
                toolName: 'clientSelectImage',
                args: { message: 'Select a landscape image' },
                state: 'call' as const
              }
            }
          ]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Select a landscape image')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Open Image Library' })
      ).toBeInTheDocument()
    })

    it('should render client redirect tool with navigation button', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-invocation' as const,
              toolInvocation: {
                toolCallId: 'redirect-test-id',
                toolName: 'clientRedirectUserToEditor',
                args: {
                  message: 'Your journey is ready!',
                  journeyId: 'journey-123'
                },
                state: 'call' as const
              }
            }
          ]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Your journey is ready!')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'See My Journey!' })
      ).toBeInTheDocument()
    })
  })

  describe('Mixed Message Parts', () => {
    it('should render messages with multiple parts correctly', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'text' as const,
              text: 'Let me search for that information.'
            },
            {
              type: 'tool-invocation' as const,
              toolInvocation: {
                toolCallId: 'search-id',
                toolName: 'agentWebSearch',
                args: { query: 'test' },
                state: 'call' as const
              }
            },
            { type: 'text' as const, text: 'Here are the results:' }
          ]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(
        screen.getByText('Let me search for that information.')
      ).toBeInTheDocument()
      expect(screen.getByText('Searching the web...')).toBeInTheDocument()
      expect(screen.getByText('Here are the results:')).toBeInTheDocument()
    })
  })

  describe('UserFeedback Integration', () => {
    it('should show user feedback for completed messages with traceId', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: 'Helpful response',
          parts: [{ type: 'text' as const, text: 'Helpful response' }],
          traceId: 'trace-123'
        }
      ] as (Message & { traceId?: string })[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByLabelText('Good Response')).toBeInTheDocument()
      expect(screen.getByLabelText('Bad Response')).toBeInTheDocument()
    })

    it('should show user feedback for last message when status is ready', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: 'First response',
          parts: [{ type: 'text' as const, text: 'First response' }],
          traceId: 'trace-1'
        },
        {
          id: '2',
          role: 'assistant' as const,
          content: 'Latest response',
          parts: [{ type: 'text' as const, text: 'Latest response' }],
          traceId: 'trace-2'
        }
      ] as (Message & { traceId?: string })[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      // Both messages should show feedback when status is ready
      const feedbackButtons = screen.getAllByLabelText('Good Response')
      expect(feedbackButtons).toHaveLength(2)
    })

    it('should not show user feedback for last message when status is not ready', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: 'First response',
          parts: [{ type: 'text' as const, text: 'First response' }],
          traceId: 'trace-1'
        },
        {
          id: '2',
          role: 'assistant' as const,
          content: 'Streaming response',
          parts: [{ type: 'text' as const, text: 'Streaming response' }],
          traceId: 'trace-2'
        }
      ] as (Message & { traceId?: string })[]

      render(
        <MessageList
          status="streaming"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      // Only first message should show feedback, not the last one while streaming
      const feedbackButtons = screen.getAllByLabelText('Good Response')
      expect(feedbackButtons).toHaveLength(1)
    })

    it('should not show user feedback without traceId on message', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: 'Response without trace',
          parts: [{ type: 'text' as const, text: 'Response without trace' }]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.queryByLabelText('Good Response')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Bad Response')).not.toBeInTheDocument()
    })

    it('should handle user feedback interactions', async () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: 'Test response',
          parts: [{ type: 'text' as const, text: 'Test response' }],
          traceId: 'trace-feedback-test'
        }
      ] as (Message & { traceId?: string })[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      const thumbsUpButton = screen.getByLabelText('Good Response')
      await userEvent.click(thumbsUpButton)

      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')
    })
  })

  describe('Unknown Part Types', () => {
    it('should handle unknown part types gracefully', () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            { type: 'text' as const, text: 'Normal text' },
            { type: 'unknown-type' as any, data: 'some data' },
            { type: 'text' as const, text: 'More normal text' }
          ]
        }
      ] as Message[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByText('Normal text')).toBeInTheDocument()
      expect(screen.getByText('More normal text')).toBeInTheDocument()
      expect(screen.queryByText('some data')).not.toBeInTheDocument()
    })
  })

  describe('Complex Integration Scenarios', () => {
    it('should handle complete conversation flow with multiple message types', async () => {
      const messages = [
        {
          id: '1',
          role: 'user' as const,
          content: 'Create a journey about prayer',
          parts: [
            { type: 'text' as const, text: 'Create a journey about prayer' }
          ]
        },
        {
          id: '2',
          role: 'assistant' as const,
          content: "I'll help you create a prayer journey.",
          parts: [
            {
              type: 'text' as const,
              text: "I'll help you create a prayer journey."
            },
            {
              type: 'tool-invocation' as const,
              toolInvocation: {
                toolCallId: 'form-id',
                toolName: 'clientRequestForm',
                args: {
                  formItems: [
                    {
                      name: 'prayerType',
                      label: 'Type of Prayer',
                      type: 'radio',
                      required: true,
                      helperText: 'Choose the type of prayer journey',
                      options: [
                        { label: 'Personal', value: 'personal' },
                        { label: 'Group', value: 'group' }
                      ]
                    }
                  ]
                },
                state: 'call' as const
              }
            }
          ],
          traceId: 'conversation-trace'
        }
      ] as (Message & { traceId?: string })[]

      render(
        <MessageList
          status="ready"
          messages={messages}
          addToolResult={mockAddToolResult}
        />
      )

      // Check all elements are present
      expect(
        screen.getByText('Create a journey about prayer')
      ).toBeInTheDocument()
      expect(
        screen.getByText("I'll help you create a prayer journey.")
      ).toBeInTheDocument()
      expect(screen.getByText('Type of Prayer')).toBeInTheDocument()
      expect(screen.getByLabelText('Personal')).toBeInTheDocument()
      expect(screen.getByLabelText('Group')).toBeInTheDocument()
      expect(screen.getByLabelText('Good Response')).toBeInTheDocument()

      // Interact with form
      const groupOption = screen.getByLabelText('Group')
      await userEvent.click(groupOption)

      const submitButton = screen.getByRole('button', { name: 'Submit form' })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddToolResult).toHaveBeenCalledWith({
          toolCallId: 'form-id',
          result: { prayerType: 'group' }
        })
      })
    })
  })
})
