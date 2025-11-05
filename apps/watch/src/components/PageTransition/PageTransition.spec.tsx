import { act, render, screen } from '@testing-library/react'

import { PageTransition } from './PageTransition'

describe('PageTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('animates between route changes', () => {
    const { rerender } = render(
      <PageTransition routeKey="/initial">
        <div>Initial Page</div>
      </PageTransition>
    )

    expect(screen.getByText('Initial Page')).toBeInTheDocument()
    expect(screen.getByTestId('page-transition')).toHaveClass(
      'watch-page-transition--enter'
    )

    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(screen.getByTestId('page-transition')).not.toHaveClass(
      'watch-page-transition--enter'
    )

    rerender(
      <PageTransition routeKey="/next">
        <div>Next Page</div>
      </PageTransition>
    )

    expect(screen.getByTestId('page-transition')).toHaveClass(
      'watch-page-transition--exit'
    )
    expect(screen.getByText('Initial Page')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(screen.getByText('Next Page')).toBeInTheDocument()
    expect(screen.getByTestId('page-transition')).toHaveClass(
      'watch-page-transition--enter'
    )
  })

  it('keeps rendered page synced when route key stays the same', () => {
    const { rerender } = render(
      <PageTransition routeKey="/stable">
        <div>First Render</div>
      </PageTransition>
    )

    rerender(
      <PageTransition routeKey="/stable">
        <div>Updated Render</div>
      </PageTransition>
    )

    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(screen.getByText('Updated Render')).toBeInTheDocument()
  })
})
