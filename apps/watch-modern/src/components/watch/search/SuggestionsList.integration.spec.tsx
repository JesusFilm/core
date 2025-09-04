import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SuggestionsList } from './SuggestionsList'
import type { SuggestionItem } from './types'

const mockSuggestions: SuggestionItem[] = [
  { text: 'Jesus', metadata: { count: 100 } },
  { text: 'Bible Stories', metadata: { count: 85 } },
  { text: 'Christian Faith', metadata: { count: 70 } },
  { text: 'Gospel', metadata: { count: 60 } },
  { text: 'Salvation', metadata: { count: 50 } }
]

describe('SuggestionsList Integration Tests', () => {
  const mockOnSelect = jest.fn()
  const mockOnHighlightChange = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders suggestions list with items', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByTestId('suggestions-panel')).toBeInTheDocument()
      expect(screen.getAllByTestId(/^suggestion-item-/)).toHaveLength(5)

      // Check content
      expect(screen.getByText('Jesus')).toBeInTheDocument()
      expect(screen.getByText('Bible Stories')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('renders popular suggestions header when isPopular is true', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
          isPopular={true}
        />
      )

      expect(screen.getByText('Popular searches')).toBeInTheDocument()
    })

    it('does not render when suggestions array is empty', () => {
      render(
        <SuggestionsList
          suggestions={[]}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByTestId('suggestions-panel')).not.toBeInTheDocument()
    })

    it('shows suggestion count in footer when more than one suggestion', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('5 suggestions')).toBeInTheDocument()
    })

    it('does not show count when only one suggestion', () => {
      render(
        <SuggestionsList
          suggestions={[mockSuggestions[0]]}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText(/suggestions/)).not.toBeInTheDocument()
    })
  })

  describe('Mouse Interactions', () => {
    it('calls onSelect when suggestion is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      const firstSuggestion = screen.getByTestId('suggestion-item-0')
      await user.click(firstSuggestion)

      expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[0])
    })

    it('highlights suggestion on mouse enter', async () => {
      const user = userEvent.setup()

      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      const secondSuggestion = screen.getByTestId('suggestion-item-1')
      await user.hover(secondSuggestion)

      expect(mockOnHighlightChange).toHaveBeenCalledWith(1)
      expect(secondSuggestion).toHaveClass('highlighted')
    })

    it('removes highlight on mouse leave', async () => {
      const user = userEvent.setup()

      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      const secondSuggestion = screen.getByTestId('suggestion-item-1')
      const thirdSuggestion = screen.getByTestId('suggestion-item-2')

      expect(secondSuggestion).toHaveClass('highlighted')

      await user.hover(thirdSuggestion)
      expect(secondSuggestion).not.toHaveClass('highlighted')
      expect(thirdSuggestion).toHaveClass('highlighted')
    })
  })

  describe('Keyboard Navigation', () => {
    it('navigates down with arrow keys', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      // Simulate arrow down
      fireEvent.keyDown(document, { key: 'ArrowDown' })

      expect(mockOnHighlightChange).toHaveBeenCalledWith(0)

      // Navigate again
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      expect(mockOnHighlightChange).toHaveBeenCalledWith(1)
    })

    it('navigates up with arrow keys', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={2}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      // Navigate up
      fireEvent.keyDown(document, { key: 'ArrowUp' })
      expect(mockOnHighlightChange).toHaveBeenCalledWith(1)
    })

    it('wraps navigation from last to first', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={4}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      // Navigate down from last item
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      expect(mockOnHighlightChange).toHaveBeenCalledWith(0)
    })

    it('wraps navigation from first to last', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      // Navigate up from first item
      fireEvent.keyDown(document, { key: 'ArrowUp' })
      expect(mockOnHighlightChange).toHaveBeenCalledWith(4)
    })

    it('selects highlighted suggestion on Enter', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={2}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      fireEvent.keyDown(document, { key: 'Enter' })

      expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[2])
    })

    it('closes on Escape key', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA roles and labels', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute('aria-label', 'Search suggestions')

      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(5)

      options.forEach((option, index) => {
        expect(option).toHaveAttribute('aria-selected', index === -1 ? 'false' : 'true')
      })
    })

    it('has proper ARIA label for popular suggestions', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
          isPopular={true}
        />
      )

      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute('aria-label', 'Popular search suggestions')
    })

    it('updates aria-selected when highlight changes', () => {
      const { rerender } = render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      const options = screen.getAllByRole('option')
      options.forEach(option => {
        expect(option).toHaveAttribute('aria-selected', 'false')
      })

      // Rerender with highlighted index
      rerender(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      const updatedOptions = screen.getAllByRole('option')
      expect(updatedOptions[1]).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Visual States', () => {
    it('applies highlighted class to highlighted item', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={2}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      const highlightedItem = screen.getByTestId('suggestion-item-2')
      expect(highlightedItem).toHaveClass('highlighted')
    })

    it('applies hover styles to items', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      const firstItem = screen.getByTestId('suggestion-item-0')
      expect(firstItem).toHaveClass('suggestion-item')
    })
  })

  describe('Performance and Edge Cases', () => {
    it('handles large number of suggestions', () => {
      const largeSuggestions: SuggestionItem[] = Array.from({ length: 50 }, (_, i) => ({
        text: `Suggestion ${i + 1}`,
        metadata: { count: 100 - i }
      }))

      render(
        <SuggestionsList
          suggestions={largeSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      expect(screen.getAllByTestId(/^suggestion-item-/)).toHaveLength(50)
    })

    it('handles suggestions with long text', () => {
      const longTextSuggestions: SuggestionItem[] = [
        { text: 'A'.repeat(100), metadata: { count: 100 } },
        { text: 'B'.repeat(200), metadata: { count: 50 } }
      ]

      render(
        <SuggestionsList
          suggestions={longTextSuggestions}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
      expect(screen.getByText('B'.repeat(200))).toBeInTheDocument()
    })

    it('handles suggestions without metadata', () => {
      const suggestionsWithoutMetadata: SuggestionItem[] = [
        { text: 'No metadata 1' },
        { text: 'No metadata 2' }
      ]

      render(
        <SuggestionsList
          suggestions={suggestionsWithoutMetadata}
          highlightedIndex={-1}
          onSelect={mockOnSelect}
          onHighlightChange={mockOnHighlightChange}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('No metadata 1')).toBeInTheDocument()
      expect(screen.getByText('No metadata 2')).toBeInTheDocument()
    })
  })
})
