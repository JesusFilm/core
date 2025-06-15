import { fireEvent, render, screen } from '@testing-library/react'

import { StateEmpty } from './Empty'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

describe('StateEmpty', () => {
  const mockAppend = jest.fn()
  const defaultProps = {
    messages: [],
    append: mockAppend
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Conditional Rendering', () => {
    it('should render when messages array is empty', () => {
      render(<StateEmpty {...defaultProps} />)

      expect(screen.getByText('Customize my journey')).toBeInTheDocument()
      expect(
        screen.getByText('Translate to another language')
      ).toBeInTheDocument()
      expect(screen.getByText('Tell me about my journey')).toBeInTheDocument()
      expect(
        screen.getByText('What can I do to improve my journey?')
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          'NextSteps AI can help you make your journey more effective!Ask it anything.'
        )
      ).toBeInTheDocument()

      const chips = screen.getAllByRole('button')
      expect(chips).toHaveLength(4)
    })

    it('should return null when messages array has content', () => {
      const { container } = render(
        <StateEmpty
          messages={[{ id: '1', role: 'user', content: 'test message' }]}
          append={mockAppend}
        />
      )

      expect(container).toBeEmptyDOMElement()
      expect(screen.queryByText('Customize my journey')).not.toBeInTheDocument()
    })
  })

  describe('Chip Button Interactions', () => {
    it('should call append with customize journey message when clicked', () => {
      render(<StateEmpty {...defaultProps} />)

      fireEvent.click(screen.getByText('Customize my journey'))

      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: 'Help me customize my journey.'
      })
    })

    it('should call append with translate message when clicked', () => {
      render(<StateEmpty {...defaultProps} />)

      fireEvent.click(screen.getByText('Translate to another language'))

      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: 'Help me to translate my journey to another language.'
      })
    })

    it('should call append with tell me about journey message when clicked', () => {
      render(<StateEmpty {...defaultProps} />)

      fireEvent.click(screen.getByText('Tell me about my journey'))

      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: 'Tell me about my journey.'
      })
    })

    it('should call append with improvement message when clicked', () => {
      render(<StateEmpty {...defaultProps} />)

      fireEvent.click(screen.getByText('What can I do to improve my journey?'))

      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: 'What can I do to improve my journey?'
      })
    })
  })
})
