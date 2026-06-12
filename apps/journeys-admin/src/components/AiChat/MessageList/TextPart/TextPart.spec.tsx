import { render, screen } from '@testing-library/react'

import { TextPart } from './TextPart'

describe('TextPart', () => {
  const mockTextPart = {
    type: 'text' as const,
    text: 'This is test message content'
  }

  describe('User Messages', () => {
    const userMessage = {
      id: '1',
      role: 'user' as const,
      content: 'user message'
    }

    it('should render user message with styled box and text-part class', () => {
      render(<TextPart message={userMessage} part={mockTextPart} />)

      expect(
        screen.getByText('This is test message content')
      ).toBeInTheDocument()

      const container = screen
        .getByText('This is test message content')
        .closest('.text-part')
      expect(container).toBeInTheDocument()

      const typography = screen.getByText('This is test message content')
      expect(typography.tagName.toLowerCase()).toBe('span')
    })

    it('should not render markdown for user messages', () => {
      const userMessageWithMarkdown = {
        ...userMessage
      }
      const markdownTextPart = {
        type: 'text' as const,
        text: '**Bold text** and *italic text*'
      }

      render(
        <TextPart message={userMessageWithMarkdown} part={markdownTextPart} />
      )

      expect(
        screen.getByText('**Bold text** and *italic text*')
      ).toBeInTheDocument()
      expect(screen.queryByRole('strong')).not.toBeInTheDocument()
      expect(screen.queryByRole('emphasis')).not.toBeInTheDocument()
    })
  })

  describe('Assistant Messages', () => {
    const aiMessage = {
      id: '1',
      role: 'assistant' as const,
      content: 'AI response'
    }

    it('should render AI message with markdown and no user styling', () => {
      const markdownTextPart = {
        type: 'text' as const,
        text: 'This has **bold text** in it'
      }

      render(<TextPart message={aiMessage} part={markdownTextPart} />)

      const boldElement = screen.getByText('bold text')
      expect(boldElement).toBeInTheDocument()
      expect(boldElement.tagName.toLowerCase()).toBe('strong')

      expect(
        screen.queryByText('bold text')?.closest('.text-part')
      ).not.toBeInTheDocument()
    })

    it('should render complex markdown with multiple elements', () => {
      const markdownTextPart = {
        type: 'text' as const,
        text: "## Journey Creation\n\nHere are the steps:\n\n1. **Create** your journey\n2. *Customize* the content\n3. [Publish](https://example.com) it\n\nThat's it!"
      }

      render(<TextPart message={aiMessage} part={markdownTextPart} />)

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Journey Creation'
      )

      const orderedList = screen.getByRole('list')
      expect(orderedList.tagName.toLowerCase()).toBe('ol')

      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Create').tagName.toLowerCase()).toBe('strong')
      expect(screen.getByText('Customize')).toBeInTheDocument()
      expect(screen.getByText('Customize').tagName.toLowerCase()).toBe('em')

      const link = screen.getByRole('link', { name: 'Publish' })
      expect(link).toHaveAttribute('href', 'https://example.com')

      expect(screen.getByText("That's it!")).toBeInTheDocument()
    })
  })
})
