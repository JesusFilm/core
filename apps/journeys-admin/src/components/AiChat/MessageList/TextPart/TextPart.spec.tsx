import { render, screen } from '@testing-library/react'

import { TextPart } from './TextPart'

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockedMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>
  }
})

describe('TextPart', () => {
  const mockTextPart = {
    type: 'text' as const,
    text: 'This is test message content'
  }

  it('should render user message with styled box and collapse animation', () => {
    const userMessage = {
      id: '1',
      role: 'user' as const,
      content: 'user message'
    }

    render(<TextPart message={userMessage} part={mockTextPart} />)

    expect(screen.getByText('This is test message content')).toBeInTheDocument()

    // Test that the text-part class is present (for styling)
    const container = screen
      .getByText('This is test message content')
      .closest('.text-part')
    expect(container).toBeInTheDocument()

    // Markdown should not be rendered for user messages
    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument()
  })

  it('should render AI message with markdown', () => {
    const aiMessage = {
      id: '1',
      role: 'assistant' as const,
      content: 'AI response'
    }

    render(<TextPart message={aiMessage} part={mockTextPart} />)

    expect(screen.getByTestId('markdown')).toBeInTheDocument()
    expect(screen.getByTestId('markdown')).toHaveTextContent(
      'This is test message content'
    )

    // Test that user message styling (text-part class) is not present
    expect(
      screen.queryByText('This is test message content')?.closest('.text-part')
    ).not.toBeInTheDocument()
  })
})
