import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { DebouncedHexAlphaColorPicker } from './DebouncedHexAlphaColorPicker'

// Mock lodash debounce to control timing in tests
jest.mock('lodash/debounce', () => {
  const originalDebounce = jest.requireActual('lodash/debounce')
  return jest.fn((fn, delay) => {
    const debounced = originalDebounce(fn, delay)
    // Add a flush method for testing
    debounced.flush = () => fn()
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
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()
    })

    it('renders with enableAlpha false', () => {
      render(
        <DebouncedHexAlphaColorPicker
          color="#FF0000"
          onChange={mockOnChange}
          enableAlpha={false}
        />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()
    })

    it('displays the correct initial color', () => {
      const { container } = render(
        <DebouncedHexAlphaColorPicker
          color="#00FF00FF"
          onChange={mockOnChange}
        />
      )

      // The HexAlphaColorPicker should be present
      const colorPicker = container.querySelector('.react-colorful')
      expect(colorPicker).toBeInTheDocument()
    })

    it('has correct test id', () => {
      render(
        <DebouncedHexAlphaColorPicker color="#0000FF" onChange={mockOnChange} />
      )

      expect(screen.getByTestId('HexColorPicker')).toBeInTheDocument()
    })
  })

  describe('Color Prop Updates', () => {
    it('updates internal state when color prop changes', () => {
      const { rerender } = render(
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      // Change the color prop
      rerender(
        <DebouncedHexAlphaColorPicker color="#00FF00" onChange={mockOnChange} />
      )

      // The component should update its internal state
      // This is tested indirectly through the component not calling onChange
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('handles 8-digit hex colors with alpha', () => {
      render(
        <DebouncedHexAlphaColorPicker
          color="#FF0000AA"
          onChange={mockOnChange}
        />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()
    })

    it('handles 6-digit hex colors', () => {
      render(
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const colorPicker = screen.getByTestId('HexColorPicker')
      expect(colorPicker).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles hue slider interactions', async () => {
      const { container } = render(
        <DebouncedHexAlphaColorPicker color="#C62828" onChange={mockOnChange} />
      )

      const hue = container.querySelector(
        '.react-colorful__hue .react-colorful__interactive'
      )

      fireEvent.touchStart(hue as Element, {
        touches: [{ pageX: 0, pageY: 0 }]
      })

      // Fast-forward timers to trigger debounced function
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })
    })

    it('handles saturation area interactions', async () => {
      const { container } = render(
        <DebouncedHexAlphaColorPicker color="#C62828" onChange={mockOnChange} />
      )

      const saturation = container.querySelector(
        '.react-colorful__saturation .react-colorful__interactive'
      )

      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 50, pageY: 50 }]
      })

      // Fast-forward timers to trigger debounced function
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })
    })

    it('handles alpha slider interactions for 8-digit colors', async () => {
      const { container } = render(
        <DebouncedHexAlphaColorPicker
          color="#C62828FF"
          onChange={mockOnChange}
        />
      )

      const alpha = container.querySelector(
        '.react-colorful__alpha .react-colorful__interactive'
      )

      expect(alpha).toBeInTheDocument()

      fireEvent.mouseDown(alpha as Element, {
        clientX: 25,
        clientY: 0
      })

      // Fast-forward timers to trigger debounced function
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
      })
    })

    it('handles mouse interactions', async () => {
      const { container } = render(
        <DebouncedHexAlphaColorPicker color="#C62828" onChange={mockOnChange} />
      )

      const saturation = container.querySelector(
        '.react-colorful__saturation .react-colorful__interactive'
      )

      fireEvent.mouseDown(saturation as Element, {
        clientX: 50,
        clientY: 50
      })

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
      const { container } = render(
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const saturation = container.querySelector(
        '.react-colorful__saturation .react-colorful__interactive'
      )

      // Trigger multiple rapid changes
      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 10, pageY: 10 }]
      })
      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 20, pageY: 20 }]
      })
      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 30, pageY: 30 }]
      })

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
      const { container } = render(
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const saturation = container.querySelector(
        '.react-colorful__saturation .react-colorful__interactive'
      )

      // First change
      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 10, pageY: 10 }]
      })

      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(50)
      })

      // Second change should cancel the first
      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 20, pageY: 20 }]
      })

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
      const { container } = render(
        <DebouncedHexAlphaColorPicker color="#ff0000" onChange={mockOnChange} />
      )

      const saturation = container.querySelector(
        '.react-colorful__saturation .react-colorful__interactive'
      )

      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 50, pageY: 50 }]
      })

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
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      // Update prop
      rerender(
        <DebouncedHexAlphaColorPicker color="#00FF00" onChange={mockOnChange} />
      )

      // The component should update without triggering onChange
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Component Cleanup', () => {
    it('cancels debounced function on unmount', () => {
      const { container, unmount } = render(
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const saturation = container.querySelector(
        '.react-colorful__saturation .react-colorful__interactive'
      )

      // Trigger a change
      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 50, pageY: 50 }]
      })

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
      const { container } = render(
        <DebouncedHexAlphaColorPicker
          color="#FF0000"
          onChange={mockOnChange}
          className="custom-class"
          style={{ width: 200 }}
        />
      )

      const colorPicker = container.querySelector('.react-colorful')
      expect(colorPicker).toHaveClass('custom-class')
      expect(colorPicker).toHaveStyle('width: 200px')
    })

    it('handles undefined onChange prop gracefully', async () => {
      const { container } = render(
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={undefined} />
      )

      const saturation = container.querySelector(
        '.react-colorful__saturation .react-colorful__interactive'
      )

      // Should not throw error when onChange is undefined
      expect(() => {
        fireEvent.touchStart(saturation as Element, {
          touches: [{ pageX: 50, pageY: 50 }]
        })

        act(() => {
          jest.advanceTimersByTime(100)
        })
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid prop changes', () => {
      const { rerender } = render(
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      // Rapidly change props
      rerender(
        <DebouncedHexAlphaColorPicker color="#00FF00" onChange={mockOnChange} />
      )
      rerender(
        <DebouncedHexAlphaColorPicker color="#0000FF" onChange={mockOnChange} />
      )
      rerender(
        <DebouncedHexAlphaColorPicker color="#FFFF00" onChange={mockOnChange} />
      )

      // Should not trigger onChange from prop changes
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('handles empty or invalid color gracefully', () => {
      expect(() => {
        render(
          <DebouncedHexAlphaColorPicker color="" onChange={mockOnChange} />
        )
      }).not.toThrow()

      expect(() => {
        render(
          <DebouncedHexAlphaColorPicker
            color="invalid"
            onChange={mockOnChange}
          />
        )
      }).not.toThrow()
    })

    it('maintains state consistency during multiple interactions', async () => {
      const { container } = render(
        <DebouncedHexAlphaColorPicker color="#FF0000" onChange={mockOnChange} />
      )

      const saturation = container.querySelector(
        '.react-colorful__saturation .react-colorful__interactive'
      )
      const hue = container.querySelector(
        '.react-colorful__hue .react-colorful__interactive'
      )

      // First interaction
      fireEvent.touchStart(saturation as Element, {
        touches: [{ pageX: 50, pageY: 50 }]
      })

      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Wait for first call to complete
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1)
      })

      // Second interaction
      fireEvent.mouseDown(hue as Element, {
        clientX: 100,
        clientY: 0
      })

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
