import { render, screen } from '@testing-library/react'

import { PublishedChip } from '.'

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
    render(<PublishedChip published={false} publishPending />)

    expect(screen.getByText('Publishing...')).toBeInTheDocument()
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })

  it('should ignore a pending publish once published', () => {
    render(<PublishedChip published publishPending />)

    expect(screen.getByText('Published')).toBeInTheDocument()
  })
})
