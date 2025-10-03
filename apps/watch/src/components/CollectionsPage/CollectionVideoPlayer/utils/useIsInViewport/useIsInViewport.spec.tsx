import { act, render, screen } from '@testing-library/react'
import React, { useRef } from 'react'

import { useIsInViewport } from './useIsInViewport'

type MockedIntersectionObserver = jest.Mock<
  Partial<IntersectionObserver>,
  [IntersectionObserverCallback, IntersectionObserverInit?]
>

const mockIntersectionObserver = jest.fn() as MockedIntersectionObserver
const mockObserve = jest.fn()
const mockUnobserve = jest.fn()
const mockDisconnect = jest.fn()

const TestComponent = () => {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIsInViewport(ref)

  return (
    <div>
      <div ref={ref} data-testid="observed-element">
        {'Test Element'}
      </div>
      <div data-testid="visibility-status">
        {isVisible ? 'Element is visible' : 'Element is not visible'}
      </div>
    </div>
  )
}

describe('useIsInViewport hook', () => {
  const originalIntersectionObserver = window.IntersectionObserver

  beforeEach(() => {
    mockObserve.mockClear()
    mockUnobserve.mockClear()
    mockDisconnect.mockClear()
    mockIntersectionObserver.mockClear()

    mockIntersectionObserver.mockImplementation((callback) => {
      const instance = {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
        root: null,
        rootMargin: '',
        thresholds: []
      } as unknown as IntersectionObserver

      return instance
    })

    window.IntersectionObserver = mockIntersectionObserver as jest.Mocked<
      typeof window.IntersectionObserver
    >
  })

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver
  })

  it('should initialize with isIntersecting as false', () => {
    render(<TestComponent />)

    expect(screen.getByTestId('visibility-status').textContent).toBe(
      'Element is not visible'
    )
  })

  it('should observe the referenced element', () => {
    render(<TestComponent />)

    expect(mockObserve).toHaveBeenCalledTimes(1)
  })

  it('should update isIntersecting when intersection status changes to true', () => {
    render(<TestComponent />)

    const [callback] = mockIntersectionObserver.mock.calls[0]
    const mockObserverInstance = new window.IntersectionObserver(callback)

    act(() => {
      callback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        mockObserverInstance
      )
    })

    expect(screen.getByTestId('visibility-status').textContent).toBe(
      'Element is visible'
    )
  })

  it('should update isIntersecting when intersection status changes to false', () => {
    render(<TestComponent />)

    const [callback] = mockIntersectionObserver.mock.calls[0]
    const mockObserverInstance = new window.IntersectionObserver(callback)

    act(() => {
      callback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        mockObserverInstance
      )
    })

    act(() => {
      callback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        mockObserverInstance
      )
    })

    expect(screen.getByTestId('visibility-status').textContent).toBe(
      'Element is not visible'
    )
  })

  it('should call disconnect when component unmounts', () => {
    const { unmount } = render(<TestComponent />)

    unmount()

    expect(mockDisconnect).toHaveBeenCalledTimes(1)
  })

  it('should not observe if ref.current is null', () => {
    const NullRefComponent = () => {
      const nullRef = { current: null }
      useIsInViewport(nullRef as React.RefObject<HTMLElement | null>)
      return <div>{'Test'}</div>
    }

    render(<NullRefComponent />)

    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('should create IntersectionObserver with correct options', () => {
    render(<TestComponent />)

    expect(mockIntersectionObserver.mock.calls[0][1]).toEqual({
      rootMargin: '-25% 0px -25% 0px',
      threshold: [0, 0.1, 0.5, 1.0]
    })
  })
})
