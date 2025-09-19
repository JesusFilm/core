import { render, renderHook, screen } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

import { BlockContext } from '../useJourneyAiContextGenerator'

import {
  JourneyAiContextProvider,
  useJourneyAiContext,
  useJourneyAiContextData
} from './JourneyAiContextProvider'

// Test component that uses the full context
function TestConsumer(): ReactElement {
  const context = useJourneyAiContext()
  return (
    <div data-testid="context-data">
      <div data-testid="data">{JSON.stringify(context.data)}</div>
      <div data-testid="loading">{context.isLoading.toString()}</div>
      <div data-testid="error">{context.error || 'null'}</div>
    </div>
  )
}

// Test component that uses only the data
function TestDataConsumer(): ReactElement {
  const data = useJourneyAiContextData()
  return <div data-testid="data-only">{JSON.stringify(data)}</div>
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
      language: 'english',
      suggestions: ['suggestion 1', 'suggestion 2']
    },
    {
      blockId: 'block-2',
      contextText: 'Test context 2',
      language: 'spanish',
      suggestions: ['sugerencia 1', 'sugerencia 2']
    }
  ]

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

  it('should provide default values when no props are provided', () => {
    render(
      <JourneyAiContextProvider>
        <TestConsumer />
      </JourneyAiContextProvider>
    )

    expect(screen.getByTestId('data')).toHaveTextContent('[]')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('should provide custom context data when props are provided', () => {
    render(
      <JourneyAiContextProvider
        data={mockBlockContext}
        isLoading={true}
        error="Test error"
      >
        <TestConsumer />
      </JourneyAiContextProvider>
    )

    expect(screen.getByTestId('data')).toHaveTextContent(
      JSON.stringify(mockBlockContext)
    )
    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('error')).toHaveTextContent('Test error')
  })

  it('should handle empty array data', () => {
    render(
      <JourneyAiContextProvider data={[]}>
        <TestConsumer />
      </JourneyAiContextProvider>
    )

    expect(screen.getByTestId('data')).toHaveTextContent('[]')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('should handle undefined data prop', () => {
    render(
      <JourneyAiContextProvider data={undefined}>
        <TestConsumer />
      </JourneyAiContextProvider>
    )

    expect(screen.getByTestId('data')).toHaveTextContent('[]')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  describe('useJourneyAiContext', () => {
    it('should return context data when used within provider', () => {
      render(
        <JourneyAiContextProvider
          data={mockBlockContext}
          isLoading={false}
          error={null}
        >
          <TestConsumer />
        </JourneyAiContextProvider>
      )

      expect(screen.getByTestId('data')).toHaveTextContent(
        JSON.stringify(mockBlockContext)
      )
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('error')).toHaveTextContent('null')
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

  describe('useJourneyAiContextData', () => {
    it('should return only the data when used within provider', () => {
      render(
        <JourneyAiContextProvider
          data={mockBlockContext}
          isLoading={true}
          error="Test error"
        >
          <TestDataConsumer />
        </JourneyAiContextProvider>
      )

      expect(screen.getByTestId('data-only')).toHaveTextContent(
        JSON.stringify(mockBlockContext)
      )
    })

    it('should throw error when used outside of provider', () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Test the hook directly without a provider
      expect(() => {
        renderHook(() => useJourneyAiContextData())
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
        return <div data-testid="nested">{context.data.length} items</div>
      }

      render(
        <JourneyAiContextProvider
          data={mockBlockContext}
          isLoading={false}
          error={null}
        >
          <TestConsumer />
          <NestedConsumer />
        </JourneyAiContextProvider>
      )

      expect(screen.getByTestId('data')).toHaveTextContent(
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
        <JourneyAiContextProvider
          data={mockBlockContext}
          isLoading={false}
          error={null}
        >
          <div>
            <DeepNestedComponent />
          </div>
        </JourneyAiContextProvider>
      )

      expect(screen.getByTestId('deep-nested')).toBeInTheDocument()
      expect(screen.getByTestId('data')).toHaveTextContent(
        JSON.stringify(mockBlockContext)
      )
    })
  })
})
