import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import { render, screen } from '@testing-library/react'

import { ToolInvocationPart } from './ToolInvocationPart'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('./BasicTool', () => ({
  BasicTool: function MockedBasicTool({ callText, resultText }: any) {
    return (
      <div data-testid="basic-tool">
        {callText && <span data-testid="call-text">{callText}</span>}
        {resultText && <span data-testid="result-text">{resultText}</span>}
      </div>
    )
  }
}))

jest.mock('./agent/GenerateImageTool', () => ({
  AgentGenerateImageTool: function MockedAgentGenerateImageTool() {
    return <div data-testid="agent-generate-image-tool" />
  }
}))

jest.mock('./client/RedirectUserToEditorTool', () => ({
  ClientRedirectUserToEditorTool:
    function MockedClientRedirectUserToEditorTool() {
      return <div data-testid="client-redirect-user-to-editor-tool" />
    }
}))

jest.mock('./client/SelectImageTool', () => ({
  ClientSelectImageTool: function MockedClientSelectImageTool() {
    return <div data-testid="client-select-image-tool" />
  }
}))

jest.mock('./client/SelectVideoTool', () => ({
  ClientSelectVideoTool: function MockedClientSelectVideoTool() {
    return <div data-testid="client-select-video-tool" />
  }
}))

jest.mock('./client/RequestFormTool', () => ({
  RequestFormTool: function MockedRequestFormTool() {
    return <div data-testid="request-form-tool" />
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

    const journeyGetPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'journeyGet',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const journeyUpdatePart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'journeyUpdate',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    it('should render BasicTool for agentWebSearch', () => {
      render(
        <ToolInvocationPart
          part={agentWebSearchPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByTestId('basic-tool')).toBeInTheDocument()
      expect(screen.getByTestId('call-text')).toHaveTextContent(
        'Searching the web...'
      )
      expect(screen.queryByTestId('result-text')).not.toBeInTheDocument()
    })

    it('should render BasicTool for journeyGet with call and result text', () => {
      render(
        <ToolInvocationPart
          part={journeyGetPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByTestId('basic-tool')).toBeInTheDocument()
      expect(screen.getByTestId('call-text')).toHaveTextContent(
        'Getting journey...'
      )
      expect(screen.getByTestId('result-text')).toHaveTextContent(
        'Journey retrieved'
      )
    })

    it('should render BasicTool for journeyUpdate with call and result text', () => {
      render(
        <ToolInvocationPart
          part={journeyUpdatePart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByTestId('basic-tool')).toBeInTheDocument()
      expect(screen.getByTestId('call-text')).toHaveTextContent(
        'Updating journey...'
      )
      expect(screen.getByTestId('result-text')).toHaveTextContent(
        'Journey updated'
      )
    })
  })

  describe('Client Tool Cases', () => {
    const clientSelectImagePart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientSelectImage',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const clientRedirectUserToEditorPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientRedirectUserToEditor',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const clientSelectVideoPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientSelectVideo',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    const clientRequestFormPart = {
      type: 'tool-invocation' as const,
      toolInvocation: {
        toolCallId: 'test-id',
        toolName: 'clientRequestForm',
        args: {},
        state: 'call' as const
      }
    } as ToolInvocationUIPart

    it('should render ClientSelectImageTool for clientSelectImage', () => {
      render(
        <ToolInvocationPart
          part={clientSelectImagePart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByTestId('client-select-image-tool')).toBeInTheDocument()
    })

    it('should render ClientRedirectUserToEditorTool for clientRedirectUserToEditor', () => {
      render(
        <ToolInvocationPart
          part={clientRedirectUserToEditorPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(
        screen.getByTestId('client-redirect-user-to-editor-tool')
      ).toBeInTheDocument()
    })

    it('should render ClientSelectVideoTool for clientSelectVideo', () => {
      render(
        <ToolInvocationPart
          part={clientSelectVideoPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByTestId('client-select-video-tool')).toBeInTheDocument()
    })

    it('should render RequestFormTool for clientRequestForm', () => {
      render(
        <ToolInvocationPart
          part={clientRequestFormPart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(screen.getByTestId('request-form-tool')).toBeInTheDocument()
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

    it('should render AgentGenerateImageTool for agentGenerateImage', () => {
      render(
        <ToolInvocationPart
          part={agentGenerateImagePart}
          addToolResult={mockAddToolResult}
        />
      )

      expect(
        screen.getByTestId('agent-generate-image-tool')
      ).toBeInTheDocument()
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
