import { render, screen } from '@testing-library/react'

import { PublishedChip, isPublishPending } from '.'

describe('PublishedChip', () => {
  it('should render published', () => {
    render(<PublishedChip published />)

    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('should render unpublished', () => {
    render(<PublishedChip published={false} />)

    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('should render a pending publish', () => {
    render(<PublishedChip published={false} pending />)

    expect(screen.getByText('Publishing...')).toBeInTheDocument()
    expect(screen.getByText('Finishing publish processing')).toBeInTheDocument()
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })
})

describe('isPublishPending', () => {
  it('should be pending while a publish request is processing', () => {
    expect(
      isPublishPending({
        published: false,
        reconciliation: { status: 'processing', published: true }
      })
    ).toBe(true)
  })

  it('should not be pending once the Variant is published', () => {
    expect(
      isPublishPending({
        published: true,
        reconciliation: { status: 'processing', published: true }
      })
    ).toBe(false)
  })

  it('should not be pending for a Draft request', () => {
    expect(
      isPublishPending({
        published: false,
        reconciliation: { status: 'processing', published: false }
      })
    ).toBe(false)
  })

  it('should not be pending once reconciliation stopped processing', () => {
    expect(
      isPublishPending({
        published: false,
        reconciliation: { status: 'failed', published: true }
      })
    ).toBe(false)
    expect(isPublishPending({ published: false, reconciliation: null })).toBe(
      false
    )
  })

  it('should be pending while reconciliation is degraded but still retrying', () => {
    expect(
      isPublishPending({
        published: false,
        reconciliation: {
          status: 'degraded',
          published: true,
          retryAt: '2026-10-30T20:15:00.000Z'
        }
      })
    ).toBe(true)
  })

  it('should not be pending once degraded retries are exhausted', () => {
    expect(
      isPublishPending({
        published: false,
        reconciliation: { status: 'degraded', published: true, retryAt: null }
      })
    ).toBe(false)
    expect(
      isPublishPending({
        published: false,
        reconciliation: { status: 'degraded', published: true }
      })
    ).toBe(false)
  })
})
