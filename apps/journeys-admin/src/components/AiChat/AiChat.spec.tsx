import { ApolloClient, useApolloClient } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http } from 'msw'
import { useUser } from 'next-firebase-auth'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { mswServer } from '../../../test/mswServer'

import { AiChat } from './AiChat'

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: jest.fn()
}))

jest.mock('@apollo/client', () => ({
  __esModule: true,
  ...jest.requireActual('@apollo/client'),
  useApolloClient: jest.fn()
}))

jest.mock('../../libs/ai/langfuse/client', () => ({
  langfuseWeb: {
    score: jest.fn().mockResolvedValue(undefined)
  }
}))

const validateChatRequestPayload = (
  payload: any,
  expectedMessage: { content: string; role: string } = {
    content: '',
    role: 'user'
  }
) => {
  expect(payload).toMatchObject({
    id: expect.any(String),
    journeyId: defaultJourney.id,
    selectedStepId: 'step0.id',
    selectedBlockId: 'card0.id',
    sessionId: expect.any(String)
  })

  expect(payload.messages).toHaveLength(1)
  expect(payload.messages[0]).toMatchObject({
    role: expectedMessage.role,
    content: expectedMessage.content,
    createdAt: expect.any(String),
    id: expect.any(String),
    parts: [
      {
        text: expectedMessage.content,
        type: 'text'
      }
    ]
  })
}

const createMockStreamResponse = (chunks: string[]) => {
  return new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => {
        controller.enqueue(new TextEncoder().encode(chunk))
      })
      controller.close()
    }
  })
}

const renderAiChat = () => {
  return render(
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: defaultJourney,
          variant: 'admin'
        }}
      >
        <EditorProvider
          initialState={{
            selectedStepId: 'step0.id',
            selectedBlockId: 'card0.id'
          }}
        >
          <AiChat variant="popup" />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

describe('AiChat', () => {
  const mockUseApolloClient = useApolloClient as jest.MockedFunction<
    typeof useApolloClient
  >
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

  const mockRefetchQueries = jest.fn().mockResolvedValue([])

  // when running tests which return an mswServer response, 'Jest did not exit one second after the test run has completed.' warning appears
  // Tried to follow this ticket https://github.com/mswjs/msw/issues/170,
  // using mswServer.listen()/.resetHandlers()/.close(), but it didn't work
  beforeAll(() => {
    mswServer.listen()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mswServer.resetHandlers()

    mockUseUser.mockReturnValue({
      displayName: 'Test User',
      getIdToken: jest.fn().mockResolvedValue('mock-jwt-token')
    } as any)

    mockUseApolloClient.mockReturnValue({
      refetchQueries: mockRefetchQueries
    } as unknown as ApolloClient<object>)
  })

  afterEach(() => {
    mswServer.resetHandlers()
  })

  afterAll(() => {
    mswServer.close()
  })

  describe('Basic Functionality', () => {
    it('should send a request to the chat API', async () => {
      let capturedRequestBody: any = null

      mswServer.use(
        http.post('/api/chat', async (req) => {
          capturedRequestBody = await req.request.json()

          const stream = createMockStreamResponse([
            '0:"Hello"\n',
            '0:"! How can I help you with your journey today?"\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":3114,"completionTokens":13}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      await userEvent.type(screen.getByRole('textbox'), 'Hello')

      await userEvent.click(screen.getByTestId('FormSubmitButton'))

      await waitFor(() =>
        expect(
          screen.getByText('Hello! How can I help you with your journey today?')
        ).toBeInTheDocument()
      )

      validateChatRequestPayload(capturedRequestBody, {
        content: 'Hello',
        role: 'user'
      })
    })

    it('should display all chips and handle clicking the "Customize my journey" chip', async () => {
      let capturedRequestBody: any = null

      mswServer.use(
        http.post('/api/chat', async (req) => {
          capturedRequestBody = await req.request.json()

          const stream = createMockStreamResponse([
            'f:{"messageId":"msg-Ado0WzVxSTT379nBfNdWdHnE"}\n',
            '0:"I"\n',
            '0:" can help with that! What would you like to customize about the journey? For example"\n',
            '0:", you could update the journey\'s title, description, theme, or even"\n',
            '0:" the blocks within the journey. Tell me what you\'d like to change, and I\'ll do my best to assist.\\n"\n',
            'e:{"finishReason":"stop","usage":{"promptTokens":3115,"completionTokens":61},"isContinued":false}\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":3115,"completionTokens":61}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      // Verify all 4 chips are present initially
      expect(screen.getByText('Customize my journey')).toBeInTheDocument()
      expect(
        screen.getByText('Translate to another language')
      ).toBeInTheDocument()
      expect(screen.getByText('Tell me about my journey')).toBeInTheDocument()
      expect(
        screen.getByText('What can I do to improve my journey?')
      ).toBeInTheDocument()

      await userEvent.click(screen.getByText('Customize my journey'))

      // Wait for and verify the complete response message
      await waitFor(() =>
        expect(
          screen.getByText(
            "I can help with that! What would you like to customize about the journey? For example, you could update the journey's title, description, theme, or even the blocks within the journey. Tell me what you'd like to change, and I'll do my best to assist."
          )
        ).toBeInTheDocument()
      )

      validateChatRequestPayload(capturedRequestBody, {
        content: 'Help me customize my journey.',
        role: 'user'
      })
    })

    it('should send correct authorization headers', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('correct-jwt-token')

      mockUseUser.mockReturnValue({
        displayName: 'Test User',
        getIdToken: mockGetIdToken
      } as any)

      let capturedAuthHeader: string | null = null

      mswServer.use(
        http.post('/api/chat', async (req) => {
          capturedAuthHeader = req.request.headers.get('authorization')

          const stream = createMockStreamResponse([
            '0:"Test response"\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":5}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      await userEvent.type(screen.getByRole('textbox'), 'Test message')
      await userEvent.click(screen.getByTestId('FormSubmitButton'))

      await waitFor(() =>
        expect(screen.getByText('Test response')).toBeInTheDocument()
      )

      expect(capturedAuthHeader).toBe('JWT correct-jwt-token')
      expect(mockGetIdToken).toHaveBeenCalled()
    })
  })

  describe('UI State Management', () => {
    it('should handle stop button click during streaming with UI changes', async () => {
      mswServer.use(
        http.post('/api/chat', async () => {
          await delay(100)

          // this response should never be seen due to abort (stop button click)
          const stream = createMockStreamResponse([
            '0:"This response should never be seen due to abort"\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":5}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      // Initial state: submit button should be present, stop button should not
      expect(screen.getByTestId('FormSubmitButton')).toBeInTheDocument()
      expect(screen.queryByTestId('FormStopButton')).not.toBeInTheDocument()

      await userEvent.type(screen.getByRole('textbox'), 'Tell me a long story')
      await userEvent.click(screen.getByTestId('FormSubmitButton'))

      // Wait for streaming to begin (stop button should appear)
      await waitFor(() => {
        expect(screen.getByTestId('FormStopButton')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('FormStopButton'))

      // should return to normal state
      await waitFor(() => {
        expect(screen.getByTestId('FormSubmitButton')).toBeInTheDocument()
        expect(screen.queryByTestId('FormStopButton')).not.toBeInTheDocument()
      })
    })

    it('should display loading state during message processing', async () => {
      mswServer.use(
        http.post('/api/chat', async () => {
          await delay(100)

          const stream = createMockStreamResponse([
            '0:"Response after loading"\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":5}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      // Initial state - no loading
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()

      await userEvent.type(screen.getByRole('textbox'), 'Test message')
      await userEvent.click(screen.getByTestId('FormSubmitButton'))

      // Loading should appear immediately after submission
      expect(screen.getByRole('progressbar')).toBeInTheDocument()

      // Wait for response and verify loading disappears
      await waitFor(() =>
        expect(screen.getByText('Response after loading')).toBeInTheDocument()
      )

      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      )
    })
  })

  describe('Error Handling', () => {
    it('should display error state and handle retry functionality', async () => {
      // First request fails with 500 error
      mswServer.use(
        http.post('/api/chat', async () => {
          return new Response(null, { status: 500 })
        })
      )

      renderAiChat()

      await userEvent.type(screen.getByRole('textbox'), 'Test message')
      await userEvent.click(screen.getByTestId('FormSubmitButton'))

      await waitFor(() => {
        expect(
          screen.getByText('An error occurred. Please try again.')
        ).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()

      // Now mock a successful retry
      mswServer.use(
        http.post('/api/chat', async () => {
          const stream = createMockStreamResponse([
            '0:"Retry successful!"\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":5}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

      await waitFor(() => {
        expect(screen.getByText('Retry successful!')).toBeInTheDocument()
      })

      expect(
        screen.queryByText('An error occurred. Please try again.')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })

    it('should display error state when missing auth token', async () => {
      mockUseUser.mockReturnValue({
        displayName: 'Test User',
        getIdToken: jest.fn().mockResolvedValue(null)
      } as any)

      // Mock successful API call (should not be reached due to auth error)
      mswServer.use(
        http.post('/api/chat', async () => {
          const stream = createMockStreamResponse([
            '0:"Hello"\n',
            '0:"! How can I help you with your journey today?"\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":3114,"completionTokens":13}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      await userEvent.type(screen.getByRole('textbox'), 'Test message')
      await userEvent.click(screen.getByTestId('FormSubmitButton'))

      await waitFor(() => {
        expect(
          screen.getByText('An error occurred. Please try again.')
        ).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()

      // Ensure the successful response text does not appear (auth should have prevented API call)
      expect(
        screen.queryByText('Hello! How can I help you with your journey today?')
      ).not.toBeInTheDocument()
    })
  })

  describe('Tool Call Handling', () => {
    it('should handle journeySimpleUpdate tool call and trigger refetch', async () => {
      let capturedRequestBody: any = null

      mswServer.use(
        http.post('/api/chat', async (req) => {
          capturedRequestBody = await req.request.json()

          await delay(200)
          const stream = createMockStreamResponse([
            // // journeySimpleUpdate tool call
            'f:{"messageId":"msg-2"}\n',
            '9:{"toolCallId":"tool-call-2","toolName":"journeySimpleUpdate","args":{"journeyId":"' +
              defaultJourney.id +
              '","journey":{"title":"my test journey","description":"Journey Description","cards":[{"id":"card-1","text":"First Card"}]}}}\n',
            'a:{"toolCallId":"tool-call-2","result":{"success":true,"data":{"title":"my test journey","description":"Journey Description","cards":[{"id":"card-1","text":"First Card"}]}}}\n',
            'e:{"finishReason":"tool-calls","usage":{"promptTokens":5255,"completionTokens":51},"isContinued":false}\n',
            // Final AI response (split into two chunks)
            'f:{"messageId":"msg-3"}\n',
            '0:"I\'"\n',
            '0:"ve updated the title of your journey to \\"my test journey\\".\\n"\n',
            'e:{"finishReason":"stop","usage":{"promptTokens":5332,"completionTokens":16},"isContinued":false}\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":15786,"completionTokens":102}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      await userEvent.type(
        screen.getByRole('textbox'),
        'update the title of my journey to be "my test journey"'
      )
      await userEvent.click(screen.getByTestId('FormSubmitButton'))
      // Wait for the tool call loading state to appear
      await waitFor(() =>
        expect(screen.getByText('Updating journey...')).toBeInTheDocument()
      )

      // Wait for the tool call completion state
      await waitFor(() =>
        expect(screen.getByText('Journey updated')).toBeInTheDocument()
      )

      // Wait for the final AI response (combined string)
      await waitFor(() =>
        expect(
          screen.getByText(
            'I\'ve updated the title of your journey to "my test journey".'
          )
        ).toBeInTheDocument()
      )

      expect(mockRefetchQueries).toHaveBeenCalledWith({
        include: ['GetAdminJourney', 'GetStepBlocksWithPosition']
      })

      validateChatRequestPayload(capturedRequestBody, {
        content: 'update the title of my journey to be "my test journey"',
        role: 'user'
      })
    })

    it('should handle agentWebSearch tool call', async () => {
      let capturedRequestBody: any = null

      mswServer.use(
        http.post('/api/chat', async (req) => {
          capturedRequestBody = await req.request.json()

          await delay(200)

          const stream = createMockStreamResponse([
            'f:{"messageId":"msg-test789"}\n',
            '9:{"toolCallId":"web-search-123","toolName":"agentWebSearch","args":{"prompt":"who won the 2025 nba finals"}}\n',
            'a:{"toolCallId":"web-search-123","result":"The Oklahoma City Thunder won the 2025 NBA Finals"}\n',
            'e:{"finishReason":"tool-calls","usage":{"promptTokens":5829,"completionTokens":14},"isContinued":false}\n',
            'f:{"messageId":"msg-test890"}\n',
            '0:"The Oklahoma City Thunder won the 2025 NBA Finals"\n',
            'e:{"finishReason":"stop","usage":{"promptTokens":6354,"completionTokens":43},"isContinued":false}\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":12183,"completionTokens":57}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      await userEvent.type(
        screen.getByRole('textbox'),
        'Who won the 2025 NBA finals?'
      )
      await userEvent.click(screen.getByTestId('FormSubmitButton'))

      // Wait for the tool call loading state to appear
      await waitFor(() =>
        expect(screen.getByText('Searching the web...')).toBeInTheDocument()
      )

      // Wait for the final AI response
      await waitFor(() =>
        expect(
          screen.getByText('The Oklahoma City Thunder won the 2025 NBA Finals')
        ).toBeInTheDocument()
      )

      expect(mockRefetchQueries).not.toHaveBeenCalled()

      validateChatRequestPayload(capturedRequestBody, {
        content: 'Who won the 2025 NBA finals?',
        role: 'user'
      })
    })

    it('should handle clientRequestForm tool call with user interaction', async () => {
      let firstRequestBody: any = null

      mswServer.use(
        http.post('/api/chat', async (req) => {
          firstRequestBody = await req.request.json()
          await delay(200)
          const stream = createMockStreamResponse([
            'f:{"messageId":"msg-form-123"}\n',
            '9:{"toolCallId":"ImGv4QdGx87rgx4z","toolName":"clientRequestForm","args":{"formItems":[{"type":"text","name":"journeyTitle","label":"Journey Title","required":true,"helperText":"The title of your journey."},{"type":"textarea","name":"description","label":"Description","required":true,"helperText":"A brief description of your journey."},{"type":"text","name":"church","label":"Church","required":true,"helperText":"The name of your church."}]}}\n',
            'e:{"finishReason":"tool-calls","usage":{"promptTokens":7607,"completionTokens":56},"isContinued":false}\n',
            'd:{"finishReason":"tool-calls","usage":{"promptTokens":7607,"completionTokens":56}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      renderAiChat()

      await userEvent.type(
        screen.getByRole('textbox'),
        'create a form asking 3 questions: journey title, description, church'
      )
      await userEvent.click(screen.getByTestId('FormSubmitButton'))

      // Wait for the form to appear
      await waitFor(() =>
        expect(screen.getByLabelText('Journey Title')).toBeInTheDocument()
      )
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Church')).toBeInTheDocument()

      validateChatRequestPayload(firstRequestBody, {
        content:
          'create a form asking 3 questions: journey title, description, church',
        role: 'user'
      })

      // Fill out the form
      await userEvent.type(
        screen.getByLabelText('Journey Title'),
        'my test journey'
      )
      await userEvent.type(
        screen.getByLabelText('Description'),
        'a test journey'
      )
      await userEvent.type(screen.getByLabelText('Church'), 'My Church')

      let secondRequestBody: any = null
      // second API call - form submission
      mswServer.use(
        http.post('/api/chat', async (req) => {
          const requestBody = await req.request.json()
          secondRequestBody = requestBody
          const stream = createMockStreamResponse([
            'f:{"messageId":"msg-form-456"}\n',
            '0:"OK, I\'ve created a form with fields for \\"Journey Title\\", \\"Description\\", and \\"Church\\"."\n',
            'e:{"finishReason":"stop","usage":{"promptTokens":7683,"completionTokens":23},"isContinued":false}\n',
            'd:{"finishReason":"stop","usage":{"promptTokens":7683,"completionTokens":23}}\n'
          ])

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          })
        })
      )

      await userEvent.click(screen.getByRole('button', { name: /submit/i }))

      // verify that the clientRequestForm tool call was part of the request body
      expect(secondRequestBody.messages.length).toBeGreaterThanOrEqual(2)
      const assistantMessage = secondRequestBody.messages.find(
        (msg: any) => msg.role === 'assistant'
      )
      expect(assistantMessage).toBeDefined()
      const toolInvocationPart = assistantMessage.parts.find(
        (part: any) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation.state === 'result'
      )
      expect(toolInvocationPart).toBeDefined()
      expect(toolInvocationPart.toolInvocation).toMatchObject({
        toolCallId: 'ImGv4QdGx87rgx4z',
        toolName: 'clientRequestForm',
        state: 'result',
        result: {
          journeyTitle: 'my test journey',
          description: 'a test journey',
          church: 'My Church'
        }
      })

      // verify that the form results are displayed
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)

      expect(
        within(listItems[0]).getByText('Journey Title')
      ).toBeInTheDocument()
      expect(
        within(listItems[0]).getByText('my test journey')
      ).toBeInTheDocument()

      expect(within(listItems[1]).getByText('Description')).toBeInTheDocument()
      expect(
        within(listItems[1]).getByText('a test journey')
      ).toBeInTheDocument()

      expect(within(listItems[2]).getByText('Church')).toBeInTheDocument()
      expect(within(listItems[2]).getByText('My Church')).toBeInTheDocument()

      expect(
        screen.getByText(
          'OK, I\'ve created a form with fields for "Journey Title", "Description", and "Church".'
        )
      ).toBeInTheDocument()

      expect(mockRefetchQueries).not.toHaveBeenCalled()
    })
  })

  describe('Variant Styling', () => {
    it('should apply popup variant styling (default)', () => {
      // renders with variant="popup"
      renderAiChat()

      const container = screen.getByTestId('AiChatContainer')
      expect(container).toBeInTheDocument()

      expect(container).toHaveStyle({
        // common styles
        display: 'flex',
        'flex-direction': 'column-reverse',
        'padding-top': '40px',
        'padding-bottom': '40px',
        'padding-left': '32px',
        'padding-right': '32px',
        'min-height': '150px',
        'overflow-y': 'auto',
        // popup-specific styles
        'max-height': 'calc(100svh - 400px)',
        'flex-grow': '0',
        'justify-content': '' // undefined
      })
    })

    it('should apply page variant styling', () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                selectedStepId: 'step0.id',
                selectedBlockId: 'card0.id'
              }}
            >
              <AiChat variant="page" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const container = screen.getByTestId('AiChatContainer')
      expect(container).toBeInTheDocument()

      expect(container).toHaveStyle({
        // common styles
        display: 'flex',
        'flex-direction': 'column-reverse',
        'padding-top': '40px',
        'padding-bottom': '40px',
        'padding-left': '32px',
        'padding-right': '32px',
        'min-height': '150px',
        'overflow-y': 'auto',
        // page-specific styles
        'max-height': '100%',
        'flex-grow': '1',
        'justify-content': 'flex-end'
      })
    })
  })
})
