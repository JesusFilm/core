import { render, screen } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { renderHook } from '@testing-library/react'

import { BlockContext } from '../useJourneyAiContextGenerator'

import {
  JourneyAiContextProvider,
  useJourneyAiContext
} from './JourneyAiContextProvider'

// Test component that uses the context
function TestConsumer(): ReactElement {
  const context = useJourneyAiContext()
  return <div data-testid="context-data">{JSON.stringify(context)}</div>
}

// Test component that renders children
function TestWrapper({ children }: { children: ReactNode }): ReactElement {
  return <div data-testid="wrapper">{children}</div>
}

describe('JourneyAiContextProvider', () => {
  const mockBlockContext: BlockContext[] = [
    {
      blockId: 'block-1',
      contextText: 'Test context 1',
      language: 'english'
    },
    {
      blockId: 'block-2',
      contextText: 'Test context 2',
      language: 'spanish'
    }
  ]

  describe('JourneyAiContextProvider', () => {
    it('should render children when provided', () => {
      render(
        <JourneyAiContextProvider>
          <TestWrapper>
            <div>Child content</div>
          </TestWrapper>
        </JourneyAiContextProvider>
      )

      expect(screen.getByTestId('wrapper')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should provide default empty array when no value is provided', () => {
      render(
        <JourneyAiContextProvider>
          <TestConsumer />
        </JourneyAiContextProvider>
      )

      const contextData = screen.getByTestId('context-data')
      expect(contextData).toHaveTextContent('[]')
    })

    it('should provide custom context data when value is provided', () => {
      render(
        <JourneyAiContextProvider value={mockBlockContext}>
          <TestConsumer />
        </JourneyAiContextProvider>
      )

      const contextData = screen.getByTestId('context-data')
      expect(contextData).toHaveTextContent(JSON.stringify(mockBlockContext))
    })

    it('should handle empty array value', () => {
      render(
        <JourneyAiContextProvider value={[]}>
          <TestConsumer />
        </JourneyAiContextProvider>
      )

      const contextData = screen.getByTestId('context-data')
      expect(contextData).toHaveTextContent('[]')
    })

    it('should handle undefined value prop', () => {
      render(
        <JourneyAiContextProvider value={undefined}>
          <TestConsumer />
        </JourneyAiContextProvider>
      )

      const contextData = screen.getByTestId('context-data')
      expect(contextData).toHaveTextContent('[]')
    })
  })

  describe('useJourneyAiContext', () => {
    it('should return context data when used within provider', () => {
      render(
        <JourneyAiContextProvider value={mockBlockContext}>
          <TestConsumer />
        </JourneyAiContextProvider>
      )

      const contextData = screen.getByTestId('context-data')
      expect(contextData).toHaveTextContent(JSON.stringify(mockBlockContext))
    })

    it('should throw error when used outside of provider', () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Test the hook directly without a provider
      expect(() => {
        renderHook(() => useJourneyAiContext())
      }).toThrow(
        'useJourneyAiContext must be used within a JourneyAiContextProvider. ' +
          'If you need to generate Journey context, use useJourneyAiContextGenerator instead.'
      )

      consoleSpy.mockRestore()
    })

    it('should throw error when provider value is undefined', () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Test the hook directly without a provider
      expect(() => {
        renderHook(() => useJourneyAiContext())
      }).toThrow(
        'useJourneyAiContext must be used within a JourneyAiContextProvider. ' +
          'If you need to generate Journey context, use useJourneyAiContextGenerator instead.'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Provider integration', () => {
    it('should work with multiple nested consumers', () => {
      function NestedConsumer(): ReactElement {
        const context = useJourneyAiContext()
        return <div data-testid="nested">{context.length} items</div>
      }

      render(
        <JourneyAiContextProvider value={mockBlockContext}>
          <TestConsumer />
          <NestedConsumer />
        </JourneyAiContextProvider>
      )

      expect(screen.getByTestId('context-data')).toHaveTextContent(
        JSON.stringify(mockBlockContext)
      )
      expect(screen.getByTestId('nested')).toHaveTextContent('2 items')
    })

    it('should handle complex nested component structure', () => {
      function DeepNestedComponent(): ReactElement {
        return (
          <div data-testid="deep-nested">
            <TestConsumer />
          </div>
        )
      }

      render(
        <JourneyAiContextProvider value={mockBlockContext}>
          <div>
            <DeepNestedComponent />
          </div>
        </JourneyAiContextProvider>
      )

      expect(screen.getByTestId('deep-nested')).toBeInTheDocument()
      expect(screen.getByTestId('context-data')).toHaveTextContent(
        JSON.stringify(mockBlockContext)
      )
    })
  })
})
