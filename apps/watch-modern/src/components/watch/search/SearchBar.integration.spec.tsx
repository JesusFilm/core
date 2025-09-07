import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { SearchBar } from './SearchBar'
import { resetAlgoliaClient } from './suggestionsClient'

// Mock the suggestionsClient to avoid network calls
jest.mock('./suggestionsClient', () => ({
  suggestionsClient: {
    fetchPopular: jest.fn(() =>
      Promise.resolve([
        { text: 'Jesus', metadata: { count: 100 } },
        { text: 'Bible Stories', metadata: { count: 85 } },
        { text: 'Christian', metadata: { count: 70 } }
      ])
    ),
    fetchSuggestions: jest.fn((query: string) =>
      Promise.resolve([
        { text: `${query} results`, metadata: { count: 50 } },
        { text: `${query} videos`, metadata: { count: 25 } }
      ])
    )
  },
  resetAlgoliaClient: jest.fn()
}))

describe('SearchBar Integration Tests', () => {
  const mockOnSubmit = jest.fn()
  const mockOnFocus = jest.fn()
  const mockOnSuggestionsClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    resetAlgoliaClient()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<SearchBar onSubmit={mockOnSubmit} />)

      expect(screen.getByTestId('search-input')).toBeInTheDocument()
      expect(screen.getByTestId('clear-button')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    })

    it('renders with custom placeholder', () => {
      const placeholder = 'Custom search placeholder'
      render(<SearchBar onSubmit={mockOnSubmit} placeholder={placeholder} />)

      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
    })

    it('renders with initial value', () => {
      const initialValue = 'initial search'
      render(<SearchBar onSubmit={mockOnSubmit} initialValue={initialValue} />)

      expect(screen.getByTestId('search-input')).toHaveValue(initialValue)
    })
  })

  describe('Input Interactions', () => {
    it('updates input value when typing', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')
      await user.type(input, 'test query')

      expect(input).toHaveValue('test query')
    })

    it('shows clear button when input has value', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')
      const clearButton = screen.getByTestId('clear-button')

      // Initially hidden
      expect(clearButton).toHaveClass('has-value', { exact: false })

      // Type something
      await user.type(input, 'test')

      // Should now be visible
      await waitFor(() => {
        expect(clearButton).toHaveClass('has-value')
      })
    })

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')
      const clearButton = screen.getByTestId('clear-button')

      // Type and then clear
      await user.type(input, 'test query')
      expect(input).toHaveValue('test query')

      await user.click(clearButton)
      expect(input).toHaveValue('')
    })
  })

  describe('Suggestions Behavior', () => {
    it('shows popular suggestions on focus with empty input', async () => {
      render(
        <SearchBar
          onSubmit={mockOnSubmit}
          onFocus={mockOnFocus}
          onSuggestionsClose={mockOnSuggestionsClose}
        />
      )

      const input = screen.getByTestId('search-input')

      await act(async () => {
        fireEvent.focus(input)
      })

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-panel')).toBeInTheDocument()
      })

      expect(screen.getByText('Jesus')).toBeInTheDocument()
      expect(screen.getByText('Bible Stories')).toBeInTheDocument()
      expect(mockOnFocus).toHaveBeenCalled()
    })

    it('shows typed suggestions when typing', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')

      // Focus first to show suggestions
      fireEvent.focus(input)
      await user.type(input, 'jesus')

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-panel')).toBeInTheDocument()
      })

      expect(screen.getByText('jesus results')).toBeInTheDocument()
      expect(screen.getByText('jesus videos')).toBeInTheDocument()
    })

    it('selects suggestion with Enter key', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')

      // Focus and type
      fireEvent.focus(input)
      await user.type(input, 'test')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(mockOnSubmit).toHaveBeenCalledWith('test results')
    })

    it('closes suggestions with Escape key', async () => {
      const user = userEvent.setup()
      render(
        <SearchBar
          onSubmit={mockOnSubmit}
          onSuggestionsClose={mockOnSuggestionsClose}
        />
      )

      const input = screen.getByTestId('search-input')

      // Focus to show suggestions
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-panel')).toBeInTheDocument()
      })

      // Press Escape
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByTestId('suggestions-panel')).not.toBeInTheDocument()
      })

      expect(mockOnSuggestionsClose).toHaveBeenCalled()
    })

    it('closes suggestions on blur', async () => {
      render(
        <SearchBar
          onSubmit={mockOnSubmit}
          onSuggestionsClose={mockOnSuggestionsClose}
        />
      )

      const input = screen.getByTestId('search-input')

      // Focus to show suggestions
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-panel')).toBeInTheDocument()
      })

      // Blur
      fireEvent.blur(input)

      // Wait for blur delay
      await waitFor(
        () => {
          expect(screen.queryByTestId('suggestions-panel')).not.toBeInTheDocument()
        },
        { timeout: 200 }
      )

      expect(mockOnSuggestionsClose).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('navigates suggestions with arrow keys', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')

      // Focus and type
      fireEvent.focus(input)
      await user.type(input, 'test')

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-panel')).toBeInTheDocument()
      })

      // Navigate down
      await user.keyboard('{ArrowDown}')

      // First suggestion should be highlighted
      const firstSuggestion = screen.getByTestId('suggestion-item-0')
      expect(firstSuggestion).toHaveClass('highlighted')

      // Navigate down again
      await user.keyboard('{ArrowDown}')
      const secondSuggestion = screen.getByTestId('suggestion-item-1')
      expect(secondSuggestion).toHaveClass('highlighted')
    })

    it('navigates to first suggestion after last', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')

      // Focus and type
      fireEvent.focus(input)
      await user.type(input, 'test')

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-panel')).toBeInTheDocument()
      })

      // Navigate to last suggestion
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')

      // Navigate down again (should wrap to first)
      await user.keyboard('{ArrowDown}')
      const firstSuggestion = screen.getByTestId('suggestion-item-0')
      expect(firstSuggestion).toHaveClass('highlighted')
    })

    it('navigates backward with arrow up', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')

      // Focus and type
      fireEvent.focus(input)
      await user.type(input, 'test')

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-panel')).toBeInTheDocument()
      })

      // Start at first suggestion
      await user.keyboard('{ArrowDown}')
      expect(screen.getByTestId('suggestion-item-0')).toHaveClass('highlighted')

      // Navigate up (should go to last)
      await user.keyboard('{ArrowUp}')
      expect(screen.getByTestId('suggestion-item-1')).toHaveClass('highlighted')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')
      expect(input).toHaveAttribute('role', 'combobox')
      expect(input).toHaveAttribute('aria-expanded', 'false')
      expect(input).toHaveAttribute('aria-haspopup', 'listbox')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
    })

    it('updates aria-expanded when suggestions are shown', async () => {
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')

      // Initially false
      expect(input).toHaveAttribute('aria-expanded', 'false')

      // Focus to show suggestions
      fireEvent.focus(input)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('has accessible labels', () => {
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')
      const clearButton = screen.getByTestId('clear-button')
      const submitButton = screen.getByRole('button', { name: /search/i })

      expect(input).toHaveAttribute('aria-label', 'Search videos, films, and series')
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search')
      expect(submitButton).toHaveAttribute('aria-label', 'Submit search')
    })
  })

  describe('Form Submission', () => {
    it('submits on Enter key press', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')

      await user.type(input, 'search query{enter}')

      expect(mockOnSubmit).toHaveBeenCalledWith('search query')
    })

    it('submits on button click', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')
      const submitButton = screen.getByRole('button', { name: /search/i })

      await user.type(input, 'search query')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith('search query')
    })

    it('submits empty value when input is cleared', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSubmit={mockOnSubmit} />)

      const input = screen.getByTestId('search-input')
      const clearButton = screen.getByTestId('clear-button')

      await user.type(input, 'test{enter}')
      expect(mockOnSubmit).toHaveBeenCalledWith('test')

      await user.click(clearButton)
      await user.keyboard('{enter}')

      expect(mockOnSubmit).toHaveBeenCalledWith('')
    })
  })
})
