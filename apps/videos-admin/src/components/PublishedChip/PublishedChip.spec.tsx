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
})
