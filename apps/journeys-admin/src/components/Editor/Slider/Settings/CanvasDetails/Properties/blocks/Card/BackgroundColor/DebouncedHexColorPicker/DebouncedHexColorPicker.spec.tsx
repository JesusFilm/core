import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { DebouncedHexColorPicker } from './DebouncedHexColorPicker'

// Mock react-colorful to make testing more reliable
jest.mock('react-colorful', () => ({
  HexAlphaColorPicker: ({ onChange, color, ...props }: any) => (
    <div
      data-testid="HexAlphaColorPicker"
      onClick={() => onChange('#C62828EE')}
      {...props}
    >
      Mock HexAlphaColorPicker - {color}
    </div>
  ),
  HexColorPicker: ({ onChange, color, ...props }: any) => (
    <div
      data-testid="HexColorPicker"
      onClick={() => onChange('#C62828')}
      {...props}
    >
      Mock HexColorPicker - {color}
    </div>
  )
}))

// Mock lodash debounce to work with Jest 30's fake timers
jest.mock('lodash/debounce', () => {
  return jest.fn((fn, delay) => {
    let timeoutId: NodeJS.Timeout | null = null

    const debounced = (...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => fn(...args), delay)
    }

    debounced.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    debounced.flush = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
        fn()
      }
    }

    return debounced
  })
})

describe('DebouncedHexColorPicker', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Initial Rendering', () => {
    it('renders with initial color value', () => {
      render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()
    })

    it('renders with normal color picker when enableAlpha is false', () => {
      render(
        <DebouncedHexColorPicker
          color="#FF0000"
          onChange={mockOnChange}
          enableAlpha={false}
        />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()
    })

    it('displays the correct initial color', () => {
      render(
        <DebouncedHexColorPicker color="#00FF00FF" onChange={mockOnChange} />
      )

      // The mocked HexColorPicker should be present with the initial color
      expect(
        screen.getByText('Mock HexColorPicker - #00FF00FF')
      ).toBeInTheDocument()
    })

    it('has correct test id', () => {
      render(
        <DebouncedHexColorPicker color="#0000FF" onChange={mockOnChange} />
      )

      expect(screen.getByTestId('HexColorPicker')).toBeInTheDocument()
    })
  })

  describe('Color Prop Updates', () => {
    it('updates internal state when color prop changes', () => {
      const { rerender } = render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      // Change the color prop
      rerender(
        <DebouncedHexColorPicker color="#00FF00" onChange={mockOnChange} />
      )

      // The component should update its internal state
      // This is tested indirectly through the component not calling onChange
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('handles 8-digit hex colors with alpha', () => {
      render(
        <DebouncedHexColorPicker color="#FF0000AA" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()
    })

    it('handles 6-digit hex colors', () => {
      render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles hue slider interactions', async () => {
      render(
        <DebouncedHexColorPicker color="#C62828" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')

      // Click the mocked color picker to trigger onChange
      fireEvent.click(colorPicker)

      // Fast-forward timers to trigger debounced function
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })
    })

    it('handles saturation area interactions', async () => {
      render(
        <DebouncedHexColorPicker color="#C62828" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')

      // Click the mocked color picker to trigger onChange
      fireEvent.click(colorPicker)

      // Fast-forward timers to trigger debounced function
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })
    })

    it('handles alpha slider interactions for 8-digit colors', async () => {
      render(
        <DebouncedHexColorPicker
          color="#C62828FF"
          onChange={mockOnChange}
          enableAlpha={true}
        />
      )

      const colorPicker = screen.getByTestId('HexAlphaColorPicker')
      expect(colorPicker).toBeInTheDocument()

      // Click the mocked color picker to trigger onChange
      fireEvent.click(colorPicker)

      // Fast-forward timers to trigger debounced function
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })
    })

    it('handles mouse interactions', async () => {
      render(
        <DebouncedHexColorPicker color="#C62828" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()

      // Click the mocked color picker to trigger onChange
      fireEvent.click(colorPicker)

      // Fast-forward timers to trigger debounced function
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })
    })
  })

  describe('Debouncing Behavior', () => {
    it('debounces onChange calls with 100ms delay', async () => {
      render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')

      // Trigger multiple rapid changes
      fireEvent.click(colorPicker)
      fireEvent.click(colorPicker)
      fireEvent.click(colorPicker)

      // Should not be called immediately
      expect(mockOnChange).not.toHaveBeenCalled()

      // Fast-forward by less than debounce delay
      act(() => {
        jest.advanceTimersByTime(50)
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      // Fast-forward to complete debounce delay
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })
    })

    it('cancels previous debounced calls when new changes occur', async () => {
      render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')

      // First change
      fireEvent.click(colorPicker)

      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(50)
      })

      // Second change should cancel the first
      fireEvent.click(colorPicker)

      // Advance time to complete the second debounce
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Color Value Handling', () => {
    it('converts color values to uppercase', async () => {
      render(
        <DebouncedHexColorPicker color="#ff0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')

      fireEvent.click(colorPicker)

      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })

      // Check that the called value is uppercase
      const calledValue = mockOnChange.mock.calls[0][0]
      expect(calledValue).toMatch(/^#[0-9A-F]+$/)
    })

    it('maintains internal state correctly during interactions', () => {
      const { rerender } = render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      // Update prop
      rerender(
        <DebouncedHexColorPicker color="#00FF00" onChange={mockOnChange} />
      )

      // The component should update without triggering onChange
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Component Cleanup', () => {
    it('cancels debounced function on unmount', () => {
      const { unmount } = render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')

      // Trigger a change
      fireEvent.click(colorPicker)

      // Unmount before debounce completes
      unmount()

      // Advance time
      act(() => {
        jest.advanceTimersByTime(200)
      })

      // Should not call onChange after unmount
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Props Forwarding', () => {
    it('forwards additional props to HexAlphaColorPicker', () => {
      render(
        <DebouncedHexColorPicker
          color="#FF0000"
          onChange={mockOnChange}
          className="custom-class"
          style={{ width: 200 }}
        />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toHaveClass('custom-class')
      expect(colorPicker).toHaveStyle('width: 200px')
    })

    it('handles undefined onChange prop gracefully', async () => {
      render(<DebouncedHexColorPicker color="#FF0000" onChange={undefined} />)

      const colorPicker = screen.getByTestId('HexColorPicker')

      // Should not throw error when onChange is undefined
      expect(() => {
        fireEvent.click(colorPicker)

        act(() => {
          jest.advanceTimersByTime(100)
        })
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid prop changes', () => {
      const { rerender } = render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      // Rapidly change props
      rerender(
        <DebouncedHexColorPicker color="#00FF00" onChange={mockOnChange} />
      )
      rerender(
        <DebouncedHexColorPicker color="#0000FF" onChange={mockOnChange} />
      )
      rerender(
        <DebouncedHexColorPicker color="#FFFF00" onChange={mockOnChange} />
      )

      // Should not trigger onChange from prop changes
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('handles empty or invalid color gracefully', () => {
      expect(() => {
        render(<DebouncedHexColorPicker color="" onChange={mockOnChange} />)
      }).not.toThrow()

      expect(() => {
        render(
          <DebouncedHexColorPicker color="invalid" onChange={mockOnChange} />
        )
      }).not.toThrow()
    })

    it('maintains state consistency during multiple interactions', async () => {
      render(
        <DebouncedHexColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')

      // First interaction
      fireEvent.click(colorPicker)

      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Wait for first call to complete
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1)
      })

      // Second interaction
      fireEvent.click(colorPicker)

      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Wait for second call to complete
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(2)
      })
    })
  })
})
